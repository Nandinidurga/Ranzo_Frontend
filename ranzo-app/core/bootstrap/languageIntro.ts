import { KEY_LANGUAGE_INTRO_DONE, loadJSON, saveJSON } from '@/data/storage';

export async function hasCompletedLanguageIntro(): Promise<boolean> {
  const done = await loadJSON<boolean>(KEY_LANGUAGE_INTRO_DONE);
  return done === true;
}

export async function markLanguageIntroComplete(): Promise<void> {
  await saveJSON(KEY_LANGUAGE_INTRO_DONE, true);
}
