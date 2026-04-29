import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField,
  SliderField,
  staticClasses,
  Navigation,
  Router,
  ServerAPI,
} from "@decky/ui";
import { callable, toaster } from "@decky/api";
import { useState, useEffect, useCallback, FC } from "react";
import { FaDice, FaBan, FaPlay, FaRedo, FaSteam } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Game {
  app_id: string;
  name: string;
  playtime_hours: number;
  last_played: number;
  is_installed: boolean;
}

interface Filters {
  installed_only: boolean;
  never_played: boolean;
  max_playtime_hours: number;
  min_playtime_hours: number;
  blacklist: string[];
}

// ─── Backend callables ────────────────────────────────────────────────────────

const pickRandom = callable<[filters: Filters], Game | null>("pick_random");
const launchGame = callable<[app_id: string], boolean>("launch_game");
const addToBlacklist = callable<[app_id: string], boolean>("add_to_blacklist");
const removeFromBlacklist = callable<[app_id: string], boolean>("remove_from_blacklist");
const getBlacklist = callable<[], string[]>("get_blacklist");
const getLibrary = callable<[filters: Filters], Game[]>("get_library");

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

// ─── Picked game card ─────────────────────────────────────────────────────────

const GameCard: FC<{
  game: Game;
  onReroll: () => void;
  onLaunch: () => void;
  onBlacklist: () => void;
  loading: boolean;
}> = ({ game, onReroll, onLaunch, onBlacklist, loading }) => (
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
      <div style={{ fontSize: "11px", color: "#8b9ba8" }}>
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
      </div>
    </div>

    {/* Action buttons */}
    <PanelSectionRow>
      <ButtonItem
        layout="below"
        onClick={onLaunch}
        style={{ flex: 1, marginRight: "4px" }}
      >
        <FaPlay style={{ marginRight: "6px" }} />
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
      <ButtonItem
        layout="below"
        onClick={onBlacklist}
        style={{ color: "#e57373" }}
      >
        <FaBan style={{ marginRight: "6px" }} />
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
    <FaSteam style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.4 }} />
    <div>{message}</div>
  </div>
);

// ─── Main plugin content ──────────────────────────────────────────────────────

const Content: FC = () => {
  const [filters, setFilters] = useState<Filters>({
    installed_only: true,
    never_played: false,
    max_playtime_hours: 0,
    min_playtime_hours: 0,
    blacklist: [],
  });

  const [pickedGame, setPickedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load blacklist on mount
  useEffect(() => {
    getBlacklist().then((bl) => {
      setFilters((f) => ({ ...f, blacklist: bl }));
    });
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
          <FaDice style={{ fontSize: "20px", color: "#66c0f4" }} />
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
                step={5}
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
                step={5}
                onChange={(v) =>
                  setFilters((f) => ({ ...f, min_playtime_hours: v }))
                }
              />
            </PanelSectionRow>
          </>
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

// ─── Plugin entry point ───────────────────────────────────────────────────────

export default definePlugin(() => {
  return {
    title: <div className={staticClasses.Title}>Backlog Picker</div>,
    content: <Content />,
    icon: <FaDice />,
    onDismount() {},
  };
});
