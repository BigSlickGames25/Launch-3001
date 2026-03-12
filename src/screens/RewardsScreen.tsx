import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { HubAccessGate } from "../components/platform/HubAccessGate";
import { HubNotice } from "../components/platform/HubNotice";
import { HubPanel } from "../components/platform/HubPanel";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { hubDailyRewardsApi } from "../platform/api/daily-rewards";
import { useHubSession } from "../platform/auth/session";
import { formatChipCount, getErrorMessage } from "../platform/lib/format";
import type { HubDailyRewardsState } from "../platform/types";
import { theme } from "../theme";

export function RewardsScreen() {
  const { profile, refreshProfile, status, token } = useHubSession();
  const [rewardState, setRewardState] = useState<HubDailyRewardsState | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  async function loadRewards() {
    if (!token || status !== "authenticated") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await hubDailyRewardsApi.get(token);
      setRewardState(response.body.data);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRewards();
  }, [status, token]);

  if (!token) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <HubAccessGate message="Create a user session before testing shared reward flows." />
      </ScreenContainer>
    );
  }

  if (status !== "authenticated") {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <HubAccessGate message="Daily rewards are restricted to verified user accounts on the current backend contract." />
      </ScreenContainer>
    );
  }

  async function handleClaim() {
    if (!token) {
      return;
    }

    setIsClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await hubDailyRewardsApi.claim(token);
      setSuccess(response.body.message || "Reward claimed.");
      await Promise.all([refreshProfile(), loadRewards()]);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <HubPanel
        subtitle="This flow reads from `/daily_rewards` and writes through `/daily_rewards/claim`."
        title="Daily rewards"
      >
        <View style={styles.summary}>
          <SummaryStat
            label="Current chips"
            value={formatChipCount(profile?.nChips)}
          />
          <SummaryStat
            label="Eligible day"
            value={rewardState ? String(rewardState.eligibleDay) : "--"}
          />
          <SummaryStat
            label="Today claimed"
            value={rewardState?.bTodayRewardClaimed ? "Yes" : "No"}
          />
        </View>
        {isLoading ? <HubNotice message="Loading reward state..." /> : null}
        {error ? <HubNotice message={error} tone="error" /> : null}
        {success ? <HubNotice message={success} tone="success" /> : null}
      </HubPanel>

      <HubPanel
        subtitle="The reward table comes from the backend settings document."
        title="Reward calendar"
      >
        <View style={styles.rewardGrid}>
          {(rewardState?.rewards ?? []).map((reward, index) => {
            const day = index + 1;
            const isEligible = rewardState?.eligibleDay === day;

            return (
              <View
                key={`${day}-${reward}`}
                style={[
                  styles.rewardCard,
                  isEligible && styles.rewardCardEligible
                ]}
              >
                <Text style={styles.rewardDay}>Day {day}</Text>
                <Text style={styles.rewardValue}>{formatChipCount(reward)}</Text>
                <Text style={styles.rewardMeta}>
                  {isEligible ? "Next reward" : "Queued"}
                </Text>
              </View>
            );
          })}
        </View>
        <GameButton
          disabled={Boolean(rewardState?.bTodayRewardClaimed) || isClaiming}
          label="Claim Reward"
          onPress={() => {
            void handleClaim();
          }}
          subtitle="Credits the shared wallet and writes a reward transaction"
          tone="primary"
        />
      </HubPanel>
    </ScreenContainer>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg
  },
  content: {
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 980,
    paddingBottom: theme.spacing.xxxl + 32,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  rewardCard: {
    backgroundColor: theme.colors.cardMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 6,
    minWidth: 130,
    padding: theme.spacing.md
  },
  rewardCardEligible: {
    borderColor: theme.colors.surface,
    borderWidth: 2
  },
  rewardDay: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  rewardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  rewardMeta: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13
  },
  rewardValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  summaryCard: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: 6,
    minWidth: 180,
    padding: theme.spacing.md
  },
  summaryLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  summaryValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  }
});
