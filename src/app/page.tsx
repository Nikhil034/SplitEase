"use client";

import {
  ActionButtonsGrid,
  BalanceCard,
  BatchSendModal,
  LoginView,
  ReceiveModal,
  RecentActivity,
  SendModal,
  SkeletonView,
  UserPill,
  WalletContainer,
  WalletHeader,
} from "@/components";
import { NotificationToast } from "@/components/NotificationToast";
import { ExpenseGroupsList } from "@/components/expense";
import { InvoiceList } from "@/components/invoices";
import { CollaborationList } from "@/components/collaborations";
import { ScheduledPayList } from "@/components/scheduled";
import { AnalysisSection } from "@/components/analysis";
import { useSend } from "@/hooks/useSend";
import { useExpenseSplitter } from "@/hooks/useExpenseSplitter";
import { useInvoices } from "@/hooks/useInvoices";
import { useScheduledPayments } from "@/hooks/useScheduledPayments";
import { useCollaborations } from "@/hooks/useCollaborations";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useBalance } from "@/hooks/useBalance";
import { useGames } from "@/hooks/useGames";
import { getActionLog, appendActionLog, generateId } from "@/lib/storage";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { GameDashboard } from "@/components/game";

function useCurrentUserMemberId(): string {
  const { user } = usePrivy();
  return useMemo(() => {
    const accounts = user?.linkedAccounts ?? [];
    if (!Array.isArray(accounts) || accounts.length === 0) return "";
    const email = accounts.find(
      (a: { type?: string }) => a.type === "email"
    ) as { address?: string } | undefined;
    const phone = accounts.find(
      (a: { type?: string }) => a.type === "phone"
    ) as { number?: string } | undefined;
    return email?.address ?? phone?.number ?? "";
  }, [user]);
}

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const currentUserMemberId = useCurrentUserMemberId();
  const [tab, setTab] = useState<"wallet" | "split" | "invoices" | "collaborate" | "autopay" | "analysis" | "games">("wallet");
  const [paidNotification, setPaidNotification] = useState(false);
  const prevReceiveCountRef = useRef(0);
  const [actionLogVersion, setActionLogVersion] = useState(0);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showBatchSend, setShowBatchSend] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address || "";
  const { balance, symbol, loading } = useBalance(walletAddress);
  const { send, isSending, error, txHash, reset } = useSend();
  const {
    transactions: txHistory,
    loading: txLoading,
    error: txError,
  } = useTransactionHistory(walletAddress, txHash || undefined);

  const {
    groups,
    addGroup,
    addMemberToGroup,
    addExpense,
    getGroupExpenses,
    getGroupBalances,
    getSettlements,
  } = useExpenseSplitter();

  const transactions = txHistory.map((tx) => ({
    type: tx.type,
    amount: tx.amount,
    timestamp: tx.formattedTimestamp,
    hash: tx.hash,
    memo: tx.memo,
  }));

  const receiveTxs = useMemo(
    () =>
      txHistory.filter((t) => t.type === "receive").map((t) => ({
        memo: t.memo,
        hash: t.hash,
        amount: t.amount,
        timestamp: t.timestamp ?? 0,
      })),
    [txHistory]
  );

  useEffect(() => {
    const count = txHistory.filter((t) => t.type === "receive").length;
    if (count > prevReceiveCountRef.current && prevReceiveCountRef.current > 0) {
      setPaidNotification(true);
    }
    prevReceiveCountRef.current = count;
  }, [txHistory]);

  const { invoices, addInvoice } = useInvoices(
    receiveTxs.map((t) => ({
      memo: t.memo,
      hash: t.hash,
      amount: t.amount,
      timestamp: typeof t.timestamp === "number" ? t.timestamp : 0,
    }))
  );

  const { collaborations, addCollaboration } = useCollaborations();
  const actionLog = useMemo(() => getActionLog(), [actionLogVersion]);
  const logAction = (type: Parameters<typeof appendActionLog>[0]["type"], extra?: Record<string, unknown>) => {
    appendActionLog({
      id: generateId(),
      type,
      timestamp: Date.now(),
      ...extra,
    });
    setActionLogVersion((v) => v + 1);
  };

  const executeScheduledPayment = useCallback(
    async (to: string, amount: string, memo: string) => {
      await send(to, amount, memo);
      logAction("scheduled_pay", { recipientId: to, amount: parseFloat(amount), memo });
    },
    [send]
  );

  const { list: scheduledList, addScheduled, cancelScheduled } = useScheduledPayments(
    executeScheduledPayment
  );

  const { games, createGame } = useGames(walletAddress);

  const handleSend = async () => {
    try {
      await send(recipient, sendAmount, memo);
      logAction("send", {
        amount: parseFloat(sendAmount),
        symbol: "aUSD",
        memo,
        recipientId: recipient,
      });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handleAddGroup = (name: string, memberIds: string[]) => {
    const ids =
      currentUserMemberId && !memberIds.includes(currentUserMemberId)
        ? [currentUserMemberId, ...memberIds]
        : memberIds;
    addGroup(name, ids);
    logAction("group_created", { extra: { groupName: name } });
  };

  const handleSettle = async (
    toIdentifier: string,
    amount: string,
    memoText: string
  ) => {
    try {
      await send(toIdentifier, amount, memoText);
      logAction("settle", {
        amount: parseFloat(amount),
        symbol: "aUSD",
        memo: memoText,
        recipientId: toIdentifier,
      });
    } catch (err) {
      console.error("Settle failed:", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  return (
    <>
      {!authenticated && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <SkeletonView />
        </div>
      )}
      <AnimatePresence>
        {ready && !authenticated && <LoginView onLogin={login} />}
      </AnimatePresence>
      <AnimatePresence>
        {authenticated && (
          <>
            <UserPill />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 w-full"
            >
              <WalletContainer>
                <nav
                  className="flex flex-wrap gap-2 mb-6 border-b pb-2"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  {(
                    [
                      "wallet",
                      "split",
                      "invoices",
                      "collaborate",
                      "autopay",
                      "games",
                      "analysis",
                    ] as const
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className="text-xs uppercase tracking-wider transition-colors py-1"
                      style={{
                        color:
                          tab === t
                            ? "var(--accent-primary-solid)"
                            : "var(--text-tertiary)",
                      }}
                    >
                      {t === "autopay" ? "Auto pay" : t}
                    </button>
                  ))}
                </nav>

                {tab === "wallet" && (
                  <>
                    <WalletHeader />
                    <BalanceCard
                      balance={balance}
                      symbol={symbol}
                      walletAddress={walletAddress}
                      onCopyAddress={copyToClipboard}
                      loading={loading}
                    />
                    <ActionButtonsGrid
                      onSendClick={() => setShowSend(true)}
                      onReceiveClick={() => setShowReceive(true)}
                      onBatchClick={() => setShowBatchSend(true)}
                    />
                    <RecentActivity
                      transactions={transactions}
                      loading={txLoading}
                      error={txError}
                      symbol={symbol}
                    />
                  </>
                )}

                {tab === "split" && (
                  <ExpenseGroupsList
                    groups={groups}
                    currentUserMemberId={currentUserMemberId}
                    getGroupExpenses={getGroupExpenses}
                    getGroupBalances={getGroupBalances}
                    getSettlements={getSettlements}
                    onAddGroup={handleAddGroup}
                    onAddMember={addMemberToGroup}
                    onAddExpense={addExpense}
                    onSettle={handleSettle}
                    isSending={isSending}
                    sendError={error}
                    sendTxHash={txHash}
                    onSendReset={reset}
                  />
                )}

                {tab === "invoices" && (
                  <InvoiceList
                    invoices={invoices}
                    onAddInvoice={(data) => {
                      addInvoice(data);
                      logAction("invoice_created", {
                        amount: data.amount,
                        symbol: "aUSD",
                        memo: data.memo,
                        recipientId: data.recipientId,
                      });
                    }}
                    symbol={symbol}
                  />
                )}

                {tab === "collaborate" && (
                  <CollaborationList
                    collaborations={collaborations}
                    onCreate={(name, totalAmount, splits) => {
                      addCollaboration(name, totalAmount, splits);
                      logAction("collab_distribute", {
                        amount: totalAmount,
                        symbol: "aUSD",
                        extra: { name },
                      });
                    }}
                  />
                )}

                {tab === "autopay" && (
                  <ScheduledPayList
                    list={scheduledList}
                    onAdd={(to, amount, memo, executeAt) => {
                      addScheduled(to, amount, memo, executeAt);
                      logAction("scheduled_pay", {
                        amount,
                        symbol: "aUSD",
                        memo,
                        recipientId: to,
                        extra: { executeAt },
                      });
                    }}
                    onCancel={cancelScheduled}
                  />
                )}

                {tab === "games" && (
                  <GameDashboard
                    games={games}
                    onCreateGame={(game) => {
                      createGame(game);
                      logAction("send", {
                        extra: { gameCreated: game.id },
                      });
                    }}
                    userWalletAddress={walletAddress}
                    userMemberId={currentUserMemberId}
                  />
                )}

                {tab === "analysis" && (
                  <AnalysisSection
                    actionLog={actionLog}
                    transactions={transactions}
                    symbol={symbol}
                  />
                )}
              </WalletContainer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SendModal
        isOpen={showSend}
        onClose={() => {
          setShowSend(false);
          reset();
          setSendAmount("");
          setRecipient("");
          setMemo("");
        }}
        recipientAddress={recipient}
        onRecipientChange={setRecipient}
        amount={sendAmount}
        onAmountChange={setSendAmount}
        memo={memo}
        onMemoChange={setMemo}
        onConfirm={handleSend}
        isSending={isSending}
        error={error}
        txHash={txHash}
      />
      <ReceiveModal
        isOpen={showReceive}
        onClose={() => setShowReceive(false)}
        walletAddress={walletAddress}
        onCopyAddress={copyToClipboard}
      />
      <BatchSendModal
        isOpen={showBatchSend}
        onClose={() => setShowBatchSend(false)}
      />
      <NotificationToast
        message="You received a payment!"
        isVisible={paidNotification}
        onDismiss={() => setPaidNotification(false)}
      />
    </>
  );
}
