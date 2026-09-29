import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField,
  SliderField,
  DropdownItem,
  Focusable,
  staticClasses,
} from "@decky/ui";
import { callable, toaster } from "@decky/api";
import { useState, useEffect, useCallback, useMemo, FC } from "react";
import { FaDice, FaBan, FaPlay, FaSteam, FaSortAmountDown, FaArrowUp, FaArrowDown, FaCheck, FaClock } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProtonFilter = "any" | "gold_plus" | "platinum_only";
type OrderStatus = "queued" | "playing" | "completed";

interface Game {
  app_id: string;
  name: string;
  playtime_hours: number;
  last_played: number;
  is_installed: boolean;
  proton_tier?: string | null;
  proton_confidence?: string | null;
  proton_reports?: number | null;
  order_position?: number | null;
  hltb_main_story_hours?: number | null;
}

interface Filters {
  installed_only: boolean;
  never_played: boolean;
  max_playtime_hours: number;
  min_playtime_hours: number;
  blacklist: string[];
  proton_filter: ProtonFilter;
  collection_id?: string | null;
}

interface Collection {
  id: string;
  name: string;
  count: number;
}

interface OrderItem {
  app_id: string;
  position: number;
  added_at: string;
  status: OrderStatus;
  deadline?: string | null;
  name: string;
  is_installed: boolean;
  playtime_hours: number;
  proton_tier?: string | null;
  hltb_main_story_hours?: number | null;
  remaining_hours?: number | null;
  reached_estimate?: boolean;
}

// ─── Backend callables ────────────────────────────────────────────────────────

const pickRandom = callable<[filters: Filters], Game | null>("pick_random");
const launchGame = callable<[app_id: string], boolean>("launch_game");
const addToBlacklist = callable<[app_id: string], boolean>("add_to_blacklist");
const removeFromBlacklist = callable<[app_id: string], boolean>("remove_from_blacklist");
const getBlacklist = callable<[], string[]>("get_blacklist");
const getLibrary = callable<[filters: Filters], Game[]>("get_library");
const getCollections = callable<[], Collection[]>("get_collections");
const refreshMetadata = callable<[app_ids: string[]], boolean>("refresh_metadata");
const refreshHltb = callable<[games: { app_id: string; name: string }[]], boolean>("refresh_hltb");

const getOrder = callable<[], OrderItem[]>("get_order");
const addToOrder = callable<[app_id: string], boolean>("add_to_order");
const removeFromOrder = callable<[app_id: string], boolean>("remove_from_order");
const moveOrderItem = callable<[app_id: string, direction: "up" | "down"], boolean>("move_order_item");
const setOrderStatus = callable<[app_id: string, status: OrderStatus], boolean>("set_order_status");
const setOrderDeadline = callable<[app_id: string, deadline: string | null], boolean>("set_order_deadline");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPlaytime(hours: number): string {
  if (hours === 0) return "Never played";
  if (hours < 1) return `${Math.round(hours * 60)}m played`;
  return `${hours.toFixed(1)}h played`;
}

function getArtworkUrl(app_id: string): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${app_id}/library_600x900.jpg`;
}

function getHeaderUrl(app_id: string): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${app_id}/header.jpg`;
}

function getCapsuleUrl(app_id: string): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${app_id}/capsule_184x69.jpg`;
}

const PROTON_TIER_RANK: Record<string, number> = {
  Platinum: 0,
  Gold: 1,
  Silver: 2,
  Bronze: 3,
  Native: 4,
  Pending: 5,
  Borked: 6,
};

function protonTierRank(tier?: string | null): number {
  if (!tier) return 99; // Unknown sorts last
  return PROTON_TIER_RANK[tier] ?? 98;
}

const PROTON_TIER_COLORS: Record<string, string> = {
  Platinum: "#b0c4de",
  Gold: "#ffd700",
  Silver: "#c0c0c0",
  Bronze: "#cd7f32",
  Borked: "#e57373",
  Pending: "#8b9ba8",
  Native: "#4caf50",
};

const ProtonBadge: FC<{ tier?: string | null }> = ({ tier }) => {
  const label = tier || "Unknown";
  const color = tier ? PROTON_TIER_COLORS[tier] || "#8b9ba8" : "#8b9ba8";
  return (
    <span
      style={{
        fontSize: "10px",
        color,
        border: `1px solid ${color}`,
        borderRadius: "4px",
        padding: "1px 5px",
        marginLeft: "6px",
      }}
    >
      {label}
    </span>
  );
};

function formatDeadline(deadline?: string | null): { text: string; overdue: boolean } | null {
  if (!deadline) return null;
  const due = new Date(deadline);
  if (isNaN(due.getTime())) return null;
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / msPerDay);

  if (daysLeft < 0) return { text: "Overdue", overdue: true };
  if (daysLeft === 0) return { text: "Due today", overdue: false };
  if (daysLeft === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `${daysLeft} days left`, overdue: false };
}

function formatRemaining(item: { hltb_main_story_hours?: number | null; remaining_hours?: number | null; reached_estimate?: boolean }): string {
  if (item.reached_estimate) return "Main story estimate reached";
  if (item.remaining_hours != null) return `~${item.remaining_hours}h remaining`;
  return "HLTB: Unknown";
}

function isoDateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function endOfMonthIso(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return d.toISOString().slice(0, 10);
}

// ─── Spin animation component ─────────────────────────────────────────────────

const SpinningDice: FC<{ spinning: boolean }> = ({ spinning }) => (
  <div
    style={{
      display: "inline-block",
      animation: spinning ? "spin 0.4s linear infinite" : "none",
    }}
  >
    <FaDice />
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ─── Tab navigation ─────────────────────────────────────────────────────────

type Tab = "pick" | "library" | "order";

const SECTION_OPTIONS: { data: Tab; label: string }[] = [
  { data: "pick", label: "Pick" },
  { data: "library", label: "Library" },
  { data: "order", label: "Order" },
];

// A single DropdownItem instead of a row of side-by-side buttons: one
// focusable element to reach with the controller, then D-pad up/down
// through the 3 options — simpler than left/right-flowing through a
// horizontal button row, and matches the same component already used for
// the ProtonDB/Collection filters elsewhere in this plugin.
// Both the native Tabs component and DropdownItem (v1.2.0/v1.2.4) behaved
// unreliably here — both are pulled dynamically from Steam's own internal
// webpack modules and may expect a surrounding page/router context a
// Decky plugin's plain sidebar content div doesn't provide. Falling back
// to plain ButtonItem — the one component type used everywhere else in
// this plugin (Play Now, Reroll, Move Up/Down, etc.) without issue.
const TabNav: FC<{ active: Tab; onChange: (t: Tab) => void }> = ({ active, onChange }) => (
  <>
    {SECTION_OPTIONS.map((section) => (
      <PanelSectionRow key={section.data}>
        <ButtonItem
          layout="below"
          onClick={() => onChange(section.data)}
          style={{
            background: active === section.data ? "#66c0f4" : undefined,
            color: active === section.data ? "#0e141b" : undefined,
            fontWeight: active === section.data ? "bold" : undefined,
          }}
        >
          {section.label}
        </ButtonItem>
      </PanelSectionRow>
    ))}
  </>
);

// ─── Picked game card ─────────────────────────────────────────────────────────

const GameCard: FC<{
  game: Game;
  onReroll: () => void;
  onLaunch: () => void;
  onBlacklist: () => void;
  onAddToOrder: () => void;
  loading: boolean;
}> = ({ game, onReroll, onLaunch, onBlacklist, onAddToOrder, loading }) => (
  <div style={{ marginTop: "8px" }}>
    {/* Game artwork */}
    <div
      style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "8px",
        background: "#1a1a2e",
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={getHeaderUrl(game.app_id)}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        style={{
          width: "100%",
          display: "block",
          borderRadius: "8px",
        }}
        alt={game.name}
      />
    </div>

    {/* Game info */}
    <div style={{ marginBottom: "8px", padding: "0 4px" }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "#c6d4df",
          marginBottom: "2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {game.name}
      </div>
      <div style={{ fontSize: "11px", color: "#8b9ba8", display: "flex", alignItems: "center" }}>
        {formatPlaytime(game.playtime_hours)}
        {game.is_installed && (
          <span
            style={{
              marginLeft: "8px",
              color: "#4caf50",
              fontSize: "10px",
            }}
          >
            ● Installed
          </span>
        )}
        <ProtonBadge tier={game.proton_tier} />
      </div>
    </div>

    {/* Action buttons */}
    <PanelSectionRow>
      <ButtonItem
        layout="below"
        onClick={onLaunch}
        style={{ flex: 1, marginRight: "4px" }}
      >
        <span style={{ marginRight: "6px" }}><FaPlay /></span>
        Play Now
      </ButtonItem>
    </PanelSectionRow>

    <PanelSectionRow>
      <ButtonItem layout="below" onClick={onReroll} disabled={loading}>
        <SpinningDice spinning={loading} />
        <span style={{ marginLeft: "6px" }}>Reroll</span>
      </ButtonItem>
    </PanelSectionRow>

    <PanelSectionRow>
      <ButtonItem layout="below" onClick={onAddToOrder}>
        <span style={{ marginRight: "6px" }}><FaSortAmountDown /></span>
        {game.order_position != null ? `In Order #${game.order_position + 1}` : "Add to Order"}
      </ButtonItem>
    </PanelSectionRow>

    <PanelSectionRow>
      <ButtonItem
        layout="below"
        onClick={onBlacklist}
        style={{ color: "#e57373" }}
      >
        <span style={{ marginRight: "6px" }}><FaBan /></span>
        Never Pick This
      </ButtonItem>
    </PanelSectionRow>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      textAlign: "center",
      padding: "24px 16px",
      color: "#8b9ba8",
      fontSize: "12px",
    }}
  >
    <span style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.4, display: "block" }}><FaSteam /></span>
    <div>{message}</div>
  </div>
);

// ─── Pick tab ───────────────────────────────────────────────────────────────

const PROTON_FILTER_OPTIONS: { data: ProtonFilter; label: string }[] = [
  { data: "any", label: "Any" },
  { data: "gold_plus", label: "Gold+" },
  { data: "platinum_only", label: "Platinum Only" },
];

const PickTab: FC = () => {
  const [filters, setFilters] = useState<Filters>({
    installed_only: true,
    never_played: false,
    max_playtime_hours: 0,
    min_playtime_hours: 0,
    blacklist: [],
    // Default to "any": ProtonDB may not be reachable on every network, and
    // an empty/unreachable cache would otherwise make Gold+ show a
    // confusing "0 games in pool" with no explanation. Gold+/Platinum
    // remain one dropdown selection away once the cache is warm.
    proton_filter: "any",
    collection_id: null,
  });

  const [pickedGame, setPickedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Load blacklist + collections on mount
  useEffect(() => {
    getBlacklist().then((bl) => {
      setFilters((f) => ({ ...f, blacklist: bl }));
    });
    getCollections().then(setCollections);
  }, []);

  // Warm the ProtonDB cache once on mount so the default "Gold+" filter
  // doesn't show "0 games in pool" before anything's been checked — the
  // pool used for warming ignores proton_filter itself (nothing would be
  // in it to warm otherwise), then the filtered count effect below re-runs.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pool = await getLibrary({
          installed_only: true,
          never_played: false,
          max_playtime_hours: 0,
          min_playtime_hours: 0,
          blacklist: [],
          proton_filter: "any",
        });
        if (cancelled || pool.length === 0) return;
        await refreshMetadata(pool.map((g) => g.app_id));
        if (!cancelled) setFilters((f) => ({ ...f }));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Backlog Picker] ProtonDB warm-up failed:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Refresh library count when filters change
  useEffect(() => {
    let cancelled = false;
    getLibrary(filters).then((games) => {
      if (!cancelled) setLibraryCount(games.length);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const handlePick = useCallback(async () => {
    setLoading(true);
    try {
      const game = await pickRandom(filters);
      if (game) {
        setPickedGame(game);
      } else {
        toaster.toast({
          title: "Backlog Picker",
          body: "No games found matching your filters!",
          duration: 3000,
        });
      }
    } catch (e) {
      toaster.toast({
        title: "Backlog Picker",
        body: "Something went wrong. Check logs.",
        duration: 3000,
      });
    }
    setLoading(false);
  }, [filters]);

  const handleLaunch = useCallback(async () => {
    if (!pickedGame) return;
    await launchGame(pickedGame.app_id);
    toaster.toast({
      title: "Backlog Picker",
      body: `Launching ${pickedGame.name}...`,
      duration: 2000,
    });
  }, [pickedGame]);

  const handleBlacklist = useCallback(async () => {
    if (!pickedGame) return;
    await addToBlacklist(pickedGame.app_id);
    toaster.toast({
      title: "Backlog Picker",
      body: `"${pickedGame.name}" will never be picked again.`,
      duration: 3000,
    });
    setFilters((f) => ({
      ...f,
      blacklist: [...f.blacklist, pickedGame.app_id],
    }));
    setPickedGame(null);
    // Auto-pick a new one
    handlePick();
  }, [pickedGame, handlePick]);

  const handleAddToOrder = useCallback(async () => {
    if (!pickedGame) return;
    const added = await addToOrder(pickedGame.app_id);
    toaster.toast({
      title: "Backlog Picker",
      body: added ? `"${pickedGame.name}" added to your order.` : `Already in your order.`,
      duration: 2500,
    });
    if (added) {
      const games = await getLibrary(filters);
      const updated = games.find((g) => g.app_id === pickedGame.app_id);
      if (updated) setPickedGame(updated);
    }
  }, [pickedGame, filters]);

  return (
    <div>
      {/* Header */}
      <PanelSection>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#66c0f4" }}><FaDice /></span>
          <span
            style={{ fontSize: "16px", fontWeight: "bold", color: "#c6d4df" }}
          >
            Backlog Picker
          </span>
        </div>
        {libraryCount !== null && (
          <div style={{ fontSize: "11px", color: "#8b9ba8" }}>
            {libraryCount} game{libraryCount !== 1 ? "s" : ""} in pool
          </div>
        )}
      </PanelSection>

      {/* Main pick button */}
      <PanelSection>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={handlePick} disabled={loading}>
            <SpinningDice spinning={loading} />
            <span style={{ marginLeft: "8px", fontSize: "14px" }}>
              {loading ? "Picking..." : pickedGame ? "Pick Again" : "Pick For Me!"}
            </span>
          </ButtonItem>
        </PanelSectionRow>

        {pickedGame && !loading && (
          <GameCard
            game={pickedGame}
            onReroll={handlePick}
            onLaunch={handleLaunch}
            onBlacklist={handleBlacklist}
            onAddToOrder={handleAddToOrder}
            loading={loading}
          />
        )}

        {!pickedGame && !loading && (
          <EmptyState message="Hit the button and let fate decide what you play next!" />
        )}
      </PanelSection>

      {/* Filters */}
      <PanelSection title="Filters">
        <PanelSectionRow>
          <ToggleField
            label="Installed Games Only"
            description="Only pick games you can play right now"
            checked={filters.installed_only}
            onChange={(v) =>
              setFilters((f) => ({ ...f, installed_only: v }))
            }
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ToggleField
            label="Never Played Only"
            description="Only pick games with 0 hours"
            checked={filters.never_played}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                never_played: v,
                // Reset playtime filters if switching to never played
                max_playtime_hours: v ? 0 : f.max_playtime_hours,
                min_playtime_hours: v ? 0 : f.min_playtime_hours,
              }))
            }
          />
        </PanelSectionRow>

        {!filters.never_played && (
          <>
            <PanelSectionRow>
              <SliderField
                label="Max Playtime"
                description={
                  filters.max_playtime_hours === 0
                    ? "No limit"
                    : `Up to ${filters.max_playtime_hours}h played`
                }
                value={filters.max_playtime_hours}
                min={0}
                max={100}
                step={1}
                onChange={(v) =>
                  setFilters((f) => ({ ...f, max_playtime_hours: v }))
                }
              />
            </PanelSectionRow>

            <PanelSectionRow>
              <SliderField
                label="Min Playtime"
                description={
                  filters.min_playtime_hours === 0
                    ? "No minimum"
                    : `At least ${filters.min_playtime_hours}h played`
                }
                value={filters.min_playtime_hours}
                min={0}
                max={100}
                step={1}
                onChange={(v) =>
                  setFilters((f) => ({ ...f, min_playtime_hours: v }))
                }
              />
            </PanelSectionRow>
          </>
        )}

        <PanelSectionRow>
          <DropdownItem
            label="ProtonDB Filter"
            description="Only pick games that run well on Deck"
            rgOptions={PROTON_FILTER_OPTIONS.map((o) => ({ data: o.data, label: o.label }))}
            selectedOption={filters.proton_filter}
            onChange={(o) => setFilters((f) => ({ ...f, proton_filter: o.data }))}
          />
        </PanelSectionRow>

        {collections.length > 0 && (
          <PanelSectionRow>
            <DropdownItem
              label="Collection"
              description="Only pick from one of your Steam collections"
              rgOptions={[
                { data: null, label: "All Collections" },
                ...collections.map((c) => ({ data: c.id, label: `${c.name} (${c.count})` })),
              ]}
              selectedOption={filters.collection_id ?? null}
              onChange={(o) => setFilters((f) => ({ ...f, collection_id: o.data }))}
            />
          </PanelSectionRow>
        )}
      </PanelSection>

      {/* Blacklist management */}
      {filters.blacklist.length > 0 && (
        <PanelSection title={`Blacklist (${filters.blacklist.length})`}>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={async () => {
                for (const id of filters.blacklist) {
                  await removeFromBlacklist(id);
                }
                setFilters((f) => ({ ...f, blacklist: [] }));
                toaster.toast({
                  title: "Backlog Picker",
                  body: "Blacklist cleared!",
                  duration: 2000,
                });
              }}
              style={{ color: "#e57373" }}
            >
              Clear Blacklist
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      )}
    </div>
  );
};

// ─── Library tab ────────────────────────────────────────────────────────────

const LIBRARY_BASE_FILTERS: Omit<Filters, "installed_only"> = {
  never_played: false,
  max_playtime_hours: 0,
  min_playtime_hours: 0,
  blacklist: [],
  proton_filter: "any",
};

const LibraryTab: FC = () => {
  const [installedOnly, setInstalledOnly] = useState(true);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const bl = await getBlacklist();
    const filters: Filters = {
      ...LIBRARY_BASE_FILTERS,
      installed_only: installedOnly,
      collection_id: collectionId,
      blacklist: bl,
    };
    const list = await getLibrary(filters);
    setGames(list);
    setLoading(false);
    // Warm the ProtonDB + HLTB caches for what's visible, then refresh once done.
    Promise.all([
      refreshMetadata(list.map((g) => g.app_id)),
      refreshHltb(list.map((g) => ({ app_id: g.app_id, name: g.name }))),
    ]).then(async () => {
      const refreshed = await getLibrary(filters);
      setGames(refreshed);
    });
  }, [installedOnly, collectionId]);

  useEffect(() => {
    load();
  }, [load]);

  // In the "All" scope the list is large and unsorted (raw Steam order), so
  // rank by ProtonDB compatibility to surface the games worth playing on Deck.
  // The small "Installed" list keeps its natural order.
  const displayedGames = useMemo(() => {
    if (installedOnly) return games;
    return [...games].sort((a, b) => protonTierRank(a.proton_tier) - protonTierRank(b.proton_tier));
  }, [games, installedOnly]);

  const handleAddToOrder = useCallback(async (game: Game) => {
    const added = await addToOrder(game.app_id);
    toaster.toast({
      title: "Backlog Picker",
      body: added ? `"${game.name}" added to your order.` : "Already in your order.",
      duration: 2500,
    });
    if (added) load();
  }, [load]);

  const scopeToggle = (
    <Focusable style={{ display: "flex", gap: "6px", padding: "0 4px 8px 4px" }} flow-children="horizontal">
      <div style={{ flex: 1 }}>
        <ButtonItem
          layout="below"
          onClick={() => setInstalledOnly(true)}
          style={{
            background: installedOnly ? "#66c0f4" : "#2a2f37",
            color: installedOnly ? "#0e141b" : "#c6d4df",
          }}
        >
          Installed
        </ButtonItem>
      </div>
      <div style={{ flex: 1 }}>
        <ButtonItem
          layout="below"
          onClick={() => setInstalledOnly(false)}
          style={{
            background: !installedOnly ? "#66c0f4" : "#2a2f37",
            color: !installedOnly ? "#0e141b" : "#c6d4df",
          }}
        >
          All
        </ButtonItem>
      </div>
    </Focusable>
  );

  const collectionFilter = collections.length > 0 && (
    <PanelSectionRow>
      <DropdownItem
        label="Collection"
        rgOptions={[
          { data: null, label: "All Collections" },
          ...collections.map((c) => ({ data: c.id, label: `${c.name} (${c.count})` })),
        ]}
        selectedOption={collectionId}
        onChange={(o) => setCollectionId(o.data)}
      />
    </PanelSectionRow>
  );

  const header = (
    <>
      {scopeToggle}
      {collectionFilter}
    </>
  );

  if (loading && games.length === 0) {
    return (
      <div>
        {header}
        <EmptyState message="Loading your library..." />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div>
        {header}
        <EmptyState message={installedOnly ? "No installed games found." : "No games found."} />
      </div>
    );
  }

  return (
    <div>
      {header}
      <PanelSection title={`Library (${games.length})`}>
        {displayedGames.map((game) => (
        <PanelSectionRow key={game.app_id}>
          <div style={{ width: "100%", padding: "4px 0" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <img
                src={getCapsuleUrl(game.app_id)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                style={{
                  width: "64px",
                  height: "24px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  flexShrink: 0,
                  background: "#1a1a2e",
                }}
                alt=""
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#c6d4df",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {game.name}
                  </span>
                  <ProtonBadge tier={game.proton_tier} />
                </div>
                <div style={{ fontSize: "11px", color: "#8b9ba8" }}>
                  {formatPlaytime(game.playtime_hours)}
                  <span style={{ marginLeft: "8px" }}>
                    {game.hltb_main_story_hours != null
                      ? `HLTB: ${game.hltb_main_story_hours}h`
                      : "HLTB: Unknown"}
                  </span>
                </div>
              </div>
            </div>
            <ButtonItem layout="below" onClick={() => handleAddToOrder(game)}>
              {game.order_position != null ? `In Order #${game.order_position + 1}` : "Add to Order"}
            </ButtonItem>
          </div>
        </PanelSectionRow>
        ))}
      </PanelSection>
    </div>
  );
};

// ─── Order tab ──────────────────────────────────────────────────────────────

const DEADLINE_OPTIONS: { label: string; value: string | null }[] = [
  { label: "1 Week", value: isoDateInDays(7) },
  { label: "2 Weeks", value: isoDateInDays(14) },
  { label: "This Month", value: endOfMonthIso() },
  { label: "No Deadline", value: null },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  playing: "Playing",
  queued: "Queued",
  completed: "Completed",
};

const OrderRow: FC<{
  item: OrderItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: "up" | "down") => void;
  onLaunch: () => void;
  onComplete: () => void;
  onSetDeadline: (deadline: string | null) => void;
}> = ({ item, index, isFirst, isLast, onMove, onLaunch, onComplete, onSetDeadline }) => {
  const deadlineInfo = formatDeadline(item.deadline);
  const primary = item.status === "playing";

  return (
    <div
      style={{
        padding: "8px 4px",
        marginBottom: "6px",
        borderRadius: "6px",
        background: primary ? "#1e2b38" : "transparent",
        borderLeft: primary ? "3px solid #66c0f4" : "3px solid transparent",
      }}
    >
      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
        <img
          src={getCapsuleUrl(item.app_id)}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          style={{
            width: "64px",
            height: "24px",
            objectFit: "cover",
            borderRadius: "4px",
            flexShrink: 0,
            background: "#1a1a2e",
          }}
          alt=""
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: primary ? "14px" : "12px",
                fontWeight: "bold",
                color: "#c6d4df",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {index + 1}. {item.name}
            </span>
            <ProtonBadge tier={item.proton_tier} />
          </div>
          <div style={{ fontSize: "11px", color: "#8b9ba8" }}>
            {STATUS_LABEL[item.status]} · {formatPlaytime(item.playtime_hours)}
            {item.status !== "completed" && <span> · {formatRemaining(item)}</span>}
            {deadlineInfo && (
              <span style={{ marginLeft: "8px", color: deadlineInfo.overdue ? "#e57373" : "#8b9ba8" }}>
                <span style={{ marginRight: "3px" }}><FaClock /></span>
                {deadlineInfo.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {item.status !== "completed" && (
        <>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={onLaunch}>
              <span style={{ marginRight: "6px" }}><FaPlay /></span>
              Launch
            </ButtonItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={onComplete}>
              <span style={{ marginRight: "6px" }}><FaCheck /></span>
              Mark Completed
            </ButtonItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <DropdownItem
              label="Deadline"
              rgOptions={DEADLINE_OPTIONS.map((o) => ({ data: o.value, label: o.label }))}
              selectedOption={item.deadline ?? null}
              onChange={(o) => onSetDeadline(o.data)}
            />
          </PanelSectionRow>
        </>
      )}

      <Focusable style={{ display: "flex", gap: "6px" }} flow-children="horizontal">
        <div style={{ flex: 1 }}>
          <ButtonItem layout="below" onClick={() => onMove("up")} disabled={isFirst}>
            <FaArrowUp />
          </ButtonItem>
        </div>
        <div style={{ flex: 1 }}>
          <ButtonItem layout="below" onClick={() => onMove("down")} disabled={isLast}>
            <FaArrowDown />
          </ButtonItem>
        </div>
      </Focusable>
    </div>
  );
};

const OrderTab: FC = () => {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await getOrder();
    setOrder(list);
    setLoading(false);
    // Warm the HLTB cache for what's in the order, then refresh once done.
    const unknown = list.filter((i) => i.hltb_main_story_hours == null);
    if (unknown.length > 0) {
      refreshHltb(unknown.map((i) => ({ app_id: i.app_id, name: i.name }))).then(async () => {
        setOrder(await getOrder());
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMove = useCallback(async (app_id: string, dir: "up" | "down") => {
    await moveOrderItem(app_id, dir);
    load();
  }, [load]);

  const handleLaunch = useCallback(async (item: OrderItem) => {
    await launchGame(item.app_id);
    toaster.toast({ title: "Backlog Picker", body: `Launching ${item.name}...`, duration: 2000 });
  }, []);

  const handleComplete = useCallback(async (item: OrderItem) => {
    await setOrderStatus(item.app_id, "completed");
    toaster.toast({ title: "Backlog Picker", body: `"${item.name}" marked completed!`, duration: 2500 });
    load();
  }, [load]);

  const handleDeadline = useCallback(async (app_id: string, deadline: string | null) => {
    await setOrderDeadline(app_id, deadline);
    load();
  }, [load]);

  if (loading) {
    return <EmptyState message="Loading your order..." />;
  }

  if (order.length === 0) {
    return <EmptyState message="Your backlog order is empty. Add games from the Library tab." />;
  }

  const activeItems = order.filter((i) => i.status !== "completed");
  const totalRemaining = activeItems.length;
  const knownRemaining = activeItems.filter((i) => i.remaining_hours != null);
  const totalHours = knownRemaining.reduce((sum, i) => sum + (i.remaining_hours || 0), 0);

  return (
    <PanelSection title="My Order">
      {order.map((item, idx) => (
        <PanelSectionRow key={item.app_id}>
          <OrderRow
            item={item}
            index={idx}
            isFirst={idx === 0}
            isLast={idx === order.length - 1}
            onMove={(dir) => handleMove(item.app_id, dir)}
            onLaunch={() => handleLaunch(item)}
            onComplete={() => handleComplete(item)}
            onSetDeadline={(d) => handleDeadline(item.app_id, d)}
          />
        </PanelSectionRow>
      ))}
      <PanelSectionRow>
        <div style={{ fontSize: "11px", color: "#8b9ba8", textAlign: "center", padding: "4px" }}>
          {totalRemaining} game{totalRemaining !== 1 ? "s" : ""} remaining
          {knownRemaining.length > 0 && <> · ~{totalHours.toFixed(0)} hours remaining</>}
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

// ─── Main plugin content ──────────────────────────────────────────────────────

const Content: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("pick");

  return (
    <div>
      <TabNav active={activeTab} onChange={setActiveTab} />
      {activeTab === "pick" && <PickTab />}
      {activeTab === "library" && <LibraryTab />}
      {activeTab === "order" && <OrderTab />}
    </div>
  );
};

// ─── Plugin entry point ───────────────────────────────────────────────────────

export default definePlugin(() => {
  return {
    title: <div className={staticClasses.Title}>Backlog Picker</div>,
    content: <Content />,
    icon: <FaDice />,
    onDismount() {},
  };
});
