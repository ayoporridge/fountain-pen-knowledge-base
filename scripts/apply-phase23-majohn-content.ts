import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase23MajohnPacks } from "./data/phase23-majohn";

export type ApplyPhase23MajohnOptions = ApplyPhase22Options;
export type ApplyPhase23MajohnResult = ApplyPhase22Result;

export async function applyPhase23MajohnContent(
  client: Client,
  options: ApplyPhase23MajohnOptions,
): Promise<ApplyPhase23MajohnResult> {
  return applyCuratedContentPacks(client, options, phase23MajohnPacks);
}
