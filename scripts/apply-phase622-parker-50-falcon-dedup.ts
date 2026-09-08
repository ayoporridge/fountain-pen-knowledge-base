import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase622Parker50Packs } from "./data/phase622-parker-50-falcon-dedup";

export type ApplyPhase622Options = ApplyPhase22Options;
export type ApplyPhase622Result = ApplyPhase22Result;

/** Apply the Parker 50 heading repair only to an owned catalog copy. */
export async function applyPhase622Parker50Dedup(
  client: Client,
  options: ApplyPhase622Options,
): Promise<ApplyPhase622Result> {
  return applyCuratedContentPacks(client, options, structuredClone(phase622Parker50Packs));
}
