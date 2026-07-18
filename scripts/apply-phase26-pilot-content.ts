import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase26PilotPacks } from "./data/phase26-pilot";

export type ApplyPhase26PilotOptions = ApplyPhase22Options;
export type ApplyPhase26PilotResult = ApplyPhase22Result;

export async function applyPhase26PilotContent(
  client: Client,
  options: ApplyPhase26PilotOptions,
): Promise<ApplyPhase26PilotResult> {
  return applyCuratedContentPacks(client, options, phase26PilotPacks);
}
