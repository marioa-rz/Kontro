"use client";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type SummaryData } from "@/lib/finance/transactions";
import { useI18n } from "@/lib/i18n";
import { Button } from "../ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { NumberCounter } from "@/components/ui/number-counter";

const COLOR_POSITIVE = "#22C55E";
const COLOR_NEGATIVE = "#EF4444";
const COLOR_SAVINGS = "#8B5CF6";

function cardColor(hex: string) {
  return { color: hex, bg: `${hex}1A` };
}

type SummaryCard = {
  titleKey: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  note?: { key: string; value: number };
};

interface SummaryCardItemProps {
  card: SummaryCard;
  index: number;
  formatCurrency: (value: number) => string;
  t: (key: string) => string;
}

function SummaryCardHeader({ card }: Pick<SummaryCardItemProps, "card">) {
  const Icon = card.icon;
  return (
    <div className="flex items-start justify-between">
      <div className="p-2 lg:p-3 rounded-xl" style={{ background: card.bg }}>
        <Icon className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: card.color }} />
      </div>
    </div>
  );
}

function SummaryCardItem({
  card,
  index,
  formatCurrency,
  t,
}: SummaryCardItemProps) {
  return (
    <AnimatedCard index={index} className="h-full">
      <Card className="bg-card border-border overflow-hidden card-shadow h-full">
        <CardContent className="p-4 lg:p-6">
          <SummaryCardHeader card={card} />
          <div className="mt-3 lg:mt-4">
            <p className="text-xs lg:text-sm text-muted-foreground">
              {t(card.titleKey)}
            </p>
            <p
              className="text-xl lg:text-2xl font-bold mt-1"
              style={{ color: card.color }}
            >
              <NumberCounter
                value={card.value}
                duration={800}
                format={formatCurrency}
                className="text-xl lg:text-2xl font-bold"
              />
            </p>
            {card.note ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t(card.note.key)}: {formatCurrency(card.note.value)}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}

type SummaryCardsProps = {
  summaryData: SummaryData;
  onAddTransaction?: () => void;
};

function buildSummaryCards(summaryData: SummaryData): SummaryCard[] {
  const balancePalette = cardColor(
    summaryData.currentBalance < 0 ? COLOR_NEGATIVE : COLOR_POSITIVE,
  );

  return [
    {
      titleKey: "dashboard.summary.totalIncome",
      value: summaryData.totalIncome,
      icon: TrendingUp,
      ...cardColor(COLOR_POSITIVE),
    },
    {
      titleKey: "dashboard.summary.totalExpenses",
      value: summaryData.totalExpenses,
      icon: TrendingDown,
      note: {
        key: "dashboard.summary.predictedExpenses",
        value: summaryData.predictedExpenses,
      },
      ...cardColor(COLOR_NEGATIVE),
    },
    {
      titleKey: "dashboard.summary.totalSaved",
      value: summaryData.totalSaved,
      icon: PiggyBank,
      ...cardColor(COLOR_SAVINGS),
    },
    {
      titleKey: "dashboard.summary.currentBalance",
      value: summaryData.currentBalance,
      icon: Wallet,
      ...balancePalette,
    },
  ];
}

export function SummaryCards({
  summaryData,
  onAddTransaction,
}: SummaryCardsProps) {
  const { formatCurrency, t } = useI18n();
  const cards = buildSummaryCards(summaryData);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((card, index) => (
          <SummaryCardItem
            key={card.titleKey}
            card={card}
            index={index}
            formatCurrency={formatCurrency}
            t={t}
          />
        ))}
      </div>
      <div className="flex flex-col items-center my-3 lg:my-4">
        <Button
          className="gap-2 w-[90%] h-10 text-background"
          onClick={onAddTransaction}
        >
          <Plus className="size-4" />
          {t("screen.transactions.add")}
        </Button>
      </div>
    </>
  );
}
