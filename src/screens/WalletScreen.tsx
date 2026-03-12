import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { HubAccessGate } from "../components/platform/HubAccessGate";
import { HubNotice } from "../components/platform/HubNotice";
import { HubPanel } from "../components/platform/HubPanel";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { hubShopApi } from "../platform/api/shop";
import { hubTransactionsApi } from "../platform/api/transactions";
import { useHubSession } from "../platform/auth/session";
import { formatChipCount, getErrorMessage } from "../platform/lib/format";
import type {
  HubShopItem,
  HubTransaction,
  HubTransactionList
} from "../platform/types";
import { theme } from "../theme";

export function WalletScreen() {
  const { profile, refreshProfile, status, token } = useHubSession();
  const [shopItems, setShopItems] = useState<HubShopItem[]>([]);
  const [transactions, setTransactions] = useState<HubTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePurchasePrice, setActivePurchasePrice] = useState<number | null>(
    null
  );

  const isAuthenticatedUser = Boolean(token) && status === "authenticated";

  async function loadWalletData() {
    if (!token || status !== "authenticated") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [shopResponse, transactionResponse] = await Promise.all([
        hubShopApi.list(token),
        hubTransactionsApi.list(token, {
          orderBy: "DESC",
          pageNumber: 1,
          size: 6,
          sort: "dCreatedDate"
        })
      ]);

      const transactionBucket = transactionResponse.body.data[0] as
        | HubTransactionList
        | undefined;

      setShopItems(shopResponse.body.data ?? []);
      setTransactions(transactionBucket?.transactions ?? []);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWalletData();
  }, [status, token]);

  if (!token) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <HubAccessGate message="Create a hub session before opening wallet features." />
      </ScreenContainer>
    );
  }

  if (status !== "authenticated") {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <HubAccessGate message="Wallet and transaction routes require a verified user account. Guest sessions can join tables but should not be treated as full wallet users." />
      </ScreenContainer>
    );
  }

  async function handlePurchase(nPrice: number) {
    if (!token) {
      return;
    }

    setActivePurchasePrice(nPrice);
    setError(null);
    setSuccess(null);

    try {
      const response = await hubShopApi.buy(token, nPrice);
      setSuccess(response.body.message || "Purchase completed.");
      await Promise.all([refreshProfile(), loadWalletData()]);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setActivePurchasePrice(null);
    }
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <HubPanel
        subtitle="Wallet state comes from the shared hub user record and transaction collection."
        title="Wallet"
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available chips</Text>
          <Text style={styles.balanceValue}>
            {formatChipCount(profile?.nChips)}
          </Text>
          <Text style={styles.balanceText}>
            This balance should be reusable across games that share the same
            backend user.
          </Text>
        </View>
        {isLoading ? <HubNotice message="Refreshing wallet data..." /> : null}
        {error ? <HubNotice message={error} tone="error" /> : null}
        {success ? <HubNotice message={success} tone="success" /> : null}
      </HubPanel>

      <HubPanel
        subtitle="Shop items are read from the backend settings document."
        title="Shop"
      >
        <View style={styles.list}>
          {shopItems.length ? (
            shopItems.map((item, index) => (
              <View key={`${item.nPrice}-${index}`} style={styles.listCard}>
                <Text style={styles.itemTitle}>
                  {formatChipCount(item.nChips as number)} chips
                </Text>
                <Text style={styles.itemBody}>
                  Price point:{" "}
                  {typeof item.nPrice === "number" ? item.nPrice : "--"}
                </Text>
                <GameButton
                  disabled={
                    !isAuthenticatedUser ||
                    typeof item.nPrice !== "number" ||
                    activePurchasePrice === item.nPrice
                  }
                  label="Buy"
                  onPress={() => {
                    if (typeof item.nPrice === "number") {
                      void handlePurchase(item.nPrice);
                    }
                  }}
                  subtitle="Calls the shared `/shop/buy` endpoint"
                  tone="primary"
                />
              </View>
            ))
          ) : (
            <HubNotice message="No shop items were returned yet. That usually means the backend settings document is empty." />
          )}
        </View>
      </HubPanel>

      <HubPanel
        subtitle="Recent transaction history proves the frontend is reading from the shared wallet ledger."
        title="Transactions"
      >
        <View style={styles.list}>
          {transactions.length ? (
            transactions.map((transaction, index) => (
              <View
                key={transaction._id ?? `${transaction.dCreatedDate}-${index}`}
                style={styles.transactionCard}
              >
                <Text style={styles.itemTitle}>
                  {transaction.eType ?? "transaction"} •{" "}
                  {formatChipCount(transaction.nAmount)}
                </Text>
                <Text style={styles.itemBody}>
                  Mode: {transaction.eMode ?? "--"} | Status:{" "}
                  {transaction.eStatus ?? "--"}
                </Text>
                <Text style={styles.itemBody}>
                  {transaction.dCreatedDate
                    ? new Date(transaction.dCreatedDate).toLocaleString()
                    : "No timestamp"}
                </Text>
              </View>
            ))
          ) : (
            <HubNotice message="No transactions were returned for this user yet." />
          )}
        </View>
        <GameButton
          label="Refresh Wallet"
          onPress={() => {
            void Promise.all([refreshProfile(), loadWalletData()]);
          }}
          subtitle="Reload chips, shop items, and transactions"
          tone="primary"
        />
      </HubPanel>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg
  },
  balanceLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  balanceText: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20
  },
  balanceValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 34
  },
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
  itemBody: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20
  },
  itemTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  },
  list: {
    gap: theme.spacing.md
  },
  listCard: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  transactionCard: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: 6,
    padding: theme.spacing.md
  }
});
