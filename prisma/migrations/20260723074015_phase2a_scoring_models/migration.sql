-- CreateEnum
CREATE TYPE "InningsStatus" AS ENUM ('YET_TO_BAT', 'IN_PROGRESS', 'DECLARED', 'ALL_OUT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OverStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'MAIDEN');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('LEGAL', 'WIDE', 'NO_BALL');

-- CreateEnum
CREATE TYPE "DismissalType" AS ENUM ('BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET', 'RETIRED_HURT', 'RETIRED_OUT', 'OBSTRUCTING_THE_FIELD', 'TIMED_OUT', 'HIT_THE_BALL_TWICE', 'OTHER');

-- CreateEnum
CREATE TYPE "CommentaryEventType" AS ENUM ('DELIVERY', 'WICKET', 'MILESTONE', 'START_OF_OVER', 'END_OF_OVER', 'INNINGS_BREAK', 'MATCH_EVENT');

-- CreateTable
CREATE TABLE "Innings" (
    "id" TEXT NOT NULL,
    "inningsNumber" INTEGER NOT NULL,
    "matchId" TEXT NOT NULL,
    "battingTeamId" TEXT NOT NULL,
    "bowlingTeamId" TEXT NOT NULL,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "totalWickets" INTEGER NOT NULL DEFAULT 0,
    "totalOvers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExtras" INTEGER NOT NULL DEFAULT 0,
    "byes" INTEGER NOT NULL DEFAULT 0,
    "legByes" INTEGER NOT NULL DEFAULT 0,
    "wides" INTEGER NOT NULL DEFAULT 0,
    "noBalls" INTEGER NOT NULL DEFAULT 0,
    "penalties" INTEGER NOT NULL DEFAULT 0,
    "status" "InningsStatus" NOT NULL DEFAULT 'YET_TO_BAT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Over" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "overNumber" INTEGER NOT NULL,
    "legalBallCount" INTEGER NOT NULL DEFAULT 0,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "bowlerRuns" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "maiden" INTEGER NOT NULL DEFAULT 0,
    "status" "OverStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Over_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ball" (
    "id" TEXT NOT NULL,
    "overId" TEXT NOT NULL,
    "ballNumber" INTEGER NOT NULL,
    "legalBallNumber" INTEGER,
    "strikerId" TEXT NOT NULL,
    "nonStrikerId" TEXT NOT NULL,
    "bowlerId" TEXT NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL,
    "batsmanRuns" INTEGER NOT NULL DEFAULT 0,
    "extras" INTEGER NOT NULL DEFAULT 0,
    "extrasType" TEXT,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "isWicket" BOOLEAN NOT NULL DEFAULT false,
    "dismissalType" "DismissalType",
    "dismissedPlayerId" TEXT,
    "fielderId" TEXT,
    "commentaryText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ball_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattingScore" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "battingPosition" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "ballsFaced" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "strikeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dismissalType" "DismissalType",
    "dismissedBy" TEXT,
    "fielderName" TEXT,
    "isNotOut" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BattingScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BowlingFigure" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "overs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ballsBowled" INTEGER NOT NULL DEFAULT 0,
    "maidens" INTEGER NOT NULL DEFAULT 0,
    "runsConceded" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "economy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "widesBowled" INTEGER NOT NULL DEFAULT 0,
    "noBallsBowled" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BowlingFigure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partnership" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "batter1Id" TEXT NOT NULL,
    "batter2Id" TEXT NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "ballsFaced" INTEGER NOT NULL DEFAULT 0,
    "wicketNumber" INTEGER,
    "startOver" DOUBLE PRECISION,
    "endOver" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FallOfWicket" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "wicketNumber" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamScore" INTEGER NOT NULL,
    "overNumber" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FallOfWicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commentary" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "inningsId" TEXT,
    "overId" TEXT,
    "ballId" TEXT,
    "overLabel" TEXT,
    "text" TEXT NOT NULL,
    "eventType" "CommentaryEventType" NOT NULL DEFAULT 'DELIVERY',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commentary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Innings_matchId_idx" ON "Innings"("matchId");

-- CreateIndex
CREATE INDEX "Innings_battingTeamId_idx" ON "Innings"("battingTeamId");

-- CreateIndex
CREATE INDEX "Innings_bowlingTeamId_idx" ON "Innings"("bowlingTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "Innings_matchId_inningsNumber_key" ON "Innings"("matchId", "inningsNumber");

-- CreateIndex
CREATE INDEX "Over_inningsId_idx" ON "Over"("inningsId");

-- CreateIndex
CREATE UNIQUE INDEX "Over_inningsId_overNumber_key" ON "Over"("inningsId", "overNumber");

-- CreateIndex
CREATE INDEX "Ball_overId_idx" ON "Ball"("overId");

-- CreateIndex
CREATE INDEX "Ball_strikerId_idx" ON "Ball"("strikerId");

-- CreateIndex
CREATE INDEX "Ball_bowlerId_idx" ON "Ball"("bowlerId");

-- CreateIndex
CREATE INDEX "Ball_dismissedPlayerId_idx" ON "Ball"("dismissedPlayerId");

-- CreateIndex
CREATE INDEX "BattingScore_inningsId_idx" ON "BattingScore"("inningsId");

-- CreateIndex
CREATE INDEX "BattingScore_playerId_idx" ON "BattingScore"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BattingScore_inningsId_playerId_key" ON "BattingScore"("inningsId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BattingScore_inningsId_battingPosition_key" ON "BattingScore"("inningsId", "battingPosition");

-- CreateIndex
CREATE INDEX "BowlingFigure_inningsId_idx" ON "BowlingFigure"("inningsId");

-- CreateIndex
CREATE INDEX "BowlingFigure_playerId_idx" ON "BowlingFigure"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BowlingFigure_inningsId_playerId_key" ON "BowlingFigure"("inningsId", "playerId");

-- CreateIndex
CREATE INDEX "Partnership_inningsId_idx" ON "Partnership"("inningsId");

-- CreateIndex
CREATE INDEX "Partnership_batter1Id_idx" ON "Partnership"("batter1Id");

-- CreateIndex
CREATE INDEX "Partnership_batter2Id_idx" ON "Partnership"("batter2Id");

-- CreateIndex
CREATE INDEX "FallOfWicket_inningsId_idx" ON "FallOfWicket"("inningsId");

-- CreateIndex
CREATE UNIQUE INDEX "FallOfWicket_inningsId_wicketNumber_key" ON "FallOfWicket"("inningsId", "wicketNumber");

-- CreateIndex
CREATE INDEX "Commentary_matchId_timestamp_idx" ON "Commentary"("matchId", "timestamp");

-- CreateIndex
CREATE INDEX "Commentary_inningsId_idx" ON "Commentary"("inningsId");

-- CreateIndex
CREATE INDEX "Commentary_overId_idx" ON "Commentary"("overId");

-- CreateIndex
CREATE INDEX "Commentary_ballId_idx" ON "Commentary"("ballId");

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_bowlingTeamId_fkey" FOREIGN KEY ("bowlingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Over" ADD CONSTRAINT "Over_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_overId_fkey" FOREIGN KEY ("overId") REFERENCES "Over"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_strikerId_fkey" FOREIGN KEY ("strikerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_nonStrikerId_fkey" FOREIGN KEY ("nonStrikerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_dismissedPlayerId_fkey" FOREIGN KEY ("dismissedPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_fielderId_fkey" FOREIGN KEY ("fielderId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingScore" ADD CONSTRAINT "BattingScore_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingScore" ADD CONSTRAINT "BattingScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BowlingFigure" ADD CONSTRAINT "BowlingFigure_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BowlingFigure" ADD CONSTRAINT "BowlingFigure_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_batter1Id_fkey" FOREIGN KEY ("batter1Id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_batter2Id_fkey" FOREIGN KEY ("batter2Id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallOfWicket" ADD CONSTRAINT "FallOfWicket_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallOfWicket" ADD CONSTRAINT "FallOfWicket_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentary" ADD CONSTRAINT "Commentary_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentary" ADD CONSTRAINT "Commentary_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentary" ADD CONSTRAINT "Commentary_overId_fkey" FOREIGN KEY ("overId") REFERENCES "Over"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentary" ADD CONSTRAINT "Commentary_ballId_fkey" FOREIGN KEY ("ballId") REFERENCES "Ball"("id") ON DELETE SET NULL ON UPDATE CASCADE;
