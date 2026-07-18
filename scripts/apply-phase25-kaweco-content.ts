import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase25KawecoPacks } from "./data/phase25-kaweco";

export type ApplyPhase25KawecoOptions = ApplyPhase22Options;
export type ApplyPhase25KawecoResult = ApplyPhase22Result;

export async function applyPhase25KawecoContent(
  client: Client,
  options: ApplyPhase25KawecoOptions,
): Promise<ApplyPhase25KawecoResult> {
  return applyCuratedContentPacks(client, options, phase25KawecoPacks);
}
