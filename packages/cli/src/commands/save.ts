/**
 * Save Command
 *
 * Saves a prompt to the user's premium account.
 * Requires authentication and premium subscription.
 */

import chalk from "chalk";
import { getPrompt } from "@jeffreysprompts/core/prompts";
import {
  apiClient,
  isAuthError,
  isPermissionError,
  isNotFoundError,
} from "../lib/api-client";
import { isLoggedIn, getCurrentUser } from "../lib/credentials";
import { shouldOutputJson } from "../lib/utils";

export interface SaveOptions {
  json?: boolean;
}

interface SaveResponse {
  saved: boolean;
  prompt_id: string;
  title: string;
  saved_at: string;
}

interface SaveErrorResponse {
  error: string;
  code?: string;
}

/**
 * Save a prompt to user's premium account
 */
export async function saveCommand(
  promptId: string,
  options: SaveOptions = {}
): Promise<void> {
  // Step 1: Check if prompt exists in local registry
  const prompt = getPrompt(promptId);
  if (!prompt) {
    if (shouldOutputJson(options)) {
      console.log(
        JSON.stringify({
          success: false,
          error: "not_found",
          message: `Prompt not found: ${promptId}`,
        })
      );
    } else {
      console.error(chalk.red(`Prompt not found: ${promptId}`));
    }
    process.exit(1);
  }

  // Step 2: Check if user is authenticated
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    if (shouldOutputJson(options)) {
      console.log(
        JSON.stringify({
          success: false,
          error: "not_authenticated",
          message: "Please log in to save prompts",
          hint: "Run 'jfp login' to sign in",
        })
      );
    } else {
      console.error(chalk.yellow("Please log in to save prompts"));
      console.log(chalk.dim("Run 'jfp login' to sign in"));
    }
    process.exit(1);
  }

  // Step 3: Check if user has premium tier
  const user = await getCurrentUser();
  if (user && user.tier !== "premium") {
    if (shouldOutputJson(options)) {
      console.log(
        JSON.stringify({
          success: false,
          error: "requires_premium",
          message: "Saving prompts requires a premium subscription",
          tier: user.tier,
        })
      );
    } else {
      console.error(chalk.yellow("Saving prompts requires a premium subscription"));
      console.log(chalk.dim("Visit https://pro.jeffreysprompts.com to upgrade"));
    }
    process.exit(1);
  }

  // Step 4: Save the prompt via API
  const response = await apiClient.post<SaveResponse | SaveErrorResponse>(
    "/cli/saved-prompts",
    { prompt_id: promptId }
  );

  // Handle errors
  if (!response.ok) {
    // Auth error (token expired)
    if (isAuthError(response)) {
      if (shouldOutputJson(options)) {
        console.log(
          JSON.stringify({
            success: false,
            error: "session_expired",
            message: "Your session has expired. Please log in again.",
            hint: "Run 'jfp login' to sign in",
          })
        );
      } else {
        console.error(chalk.yellow("Your session has expired. Please log in again."));
        console.log(chalk.dim("Run 'jfp login' to sign in"));
      }
      process.exit(1);
    }

    // Permission error (not premium on server side)
    if (isPermissionError(response)) {
      if (shouldOutputJson(options)) {
        console.log(
          JSON.stringify({
            success: false,
            error: "requires_premium",
            message: "Saving prompts requires a premium subscription",
          })
        );
      } else {
        console.error(chalk.yellow("Saving prompts requires a premium subscription"));
        console.log(chalk.dim("Visit https://pro.jeffreysprompts.com to upgrade"));
      }
      process.exit(1);
    }

    // Not found on server (shouldn't happen if local check passed)
    if (isNotFoundError(response)) {
      if (shouldOutputJson(options)) {
        console.log(
          JSON.stringify({
            success: false,
            error: "not_found",
            message: `Prompt not found: ${promptId}`,
          })
        );
      } else {
        console.error(chalk.red(`Prompt not found: ${promptId}`));
      }
      process.exit(1);
    }

    // Check for already saved (409 Conflict or specific error)
    const errorData = response.data as SaveErrorResponse | undefined;
    if (errorData?.code === "already_saved" || response.status === 409) {
      if (shouldOutputJson(options)) {
        console.log(
          JSON.stringify({
            success: true,
            already_saved: true,
            prompt_id: promptId,
            title: prompt.title,
            message: `Already saved: ${prompt.title}`,
          })
        );
      } else {
        console.log(chalk.yellow(`Already saved: ${prompt.title}`));
      }
      return; // Not an error, just already saved
    }

    // Other errors
    if (shouldOutputJson(options)) {
      console.log(
        JSON.stringify({
          success: false,
          error: "save_failed",
          message: response.error || "Failed to save prompt",
        })
      );
    } else {
      console.error(chalk.red("Failed to save prompt:"), response.error);
    }
    process.exit(1);
  }

  // Success
  const data = response.data as SaveResponse;
  if (shouldOutputJson(options)) {
    console.log(
      JSON.stringify({
        success: true,
        saved: true,
        prompt_id: data.prompt_id || promptId,
        title: data.title || prompt.title,
        saved_at: data.saved_at || new Date().toISOString(),
      })
    );
  } else {
    console.log(chalk.green(`Saved: ${data.title || prompt.title}`));
  }
}
