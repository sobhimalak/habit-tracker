import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

export async function syncExercisesToDB() {
  try {
    const jsonPath = path.join(process.cwd(), "data", "exercises.json");
    if (!fs.existsSync(jsonPath)) return;

    const jsonContent = fs.readFileSync(jsonPath, "utf8");
    const jsonExercises = JSON.parse(jsonContent);

    for (let i = 0; i < jsonExercises.length; i++) {
      const ex = jsonExercises[i];
      const stableId = `builtin-${i}`;

      await prisma.exercise.upsert({
        where: { id: stableId },
        update: {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          secondaryMuscles: ex.secondaryMuscles || [],
          equipment: ex.equipment,
          instructions: ex.instructions,
          isCustom: false,
        },
        create: {
          id: stableId,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          secondaryMuscles: ex.secondaryMuscles || [],
          equipment: ex.equipment,
          instructions: ex.instructions,
          isCustom: false,
        },
      });
    }

    console.log("Database synced with built-in Exercises library.");
  } catch (error) {
    console.error("Failed to sync exercises to DB:", error);
  }
}
