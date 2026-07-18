import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase24TwsbiPacks } from "./data/phase24-twsbi";

export type ApplyPhase24TwsbiOptions = ApplyPhase22Options;
export type ApplyPhase24TwsbiResult = ApplyPhase22Result;

export async function applyPhase24TwsbiContent(
  client: Client,
  options: ApplyPhase24TwsbiOptions,
): Promise<ApplyPhase24TwsbiResult> {
  return applyCuratedContentPacks(client, options, phase24TwsbiPacks);
}
