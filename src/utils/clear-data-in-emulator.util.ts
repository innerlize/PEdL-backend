export const clearDataInEmulator = async () => {
  const { FIRESTORE_EMULATOR_HOST, FIRESTORE_PROJECT_ID } = process.env;

  if (!FIRESTORE_EMULATOR_HOST || !FIRESTORE_PROJECT_ID) {
    throw new Error(
      'FIRESTORE_EMULATOR_HOST or FIRESTORE_PROJECT_ID is not defined',
    );
  }

  const deleteURL = `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

  try {
    const response = await fetch(deleteURL, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`Failed to clear data: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error clearing data in Firestore emulator:', error);
    throw error;
  }
};
