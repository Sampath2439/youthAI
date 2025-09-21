

import { GoogleGenAI, Type, Chat } from "@google/genai";
import { FormData, PredictionResultData, BreathingExercise, MusicGenerationResult, FoodAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getWellBeingPrediction(formData: FormData): Promise<PredictionResultData> {
  const prompt = `
    As an expert AI analyzing factors related to well-being, you are simulating a decision tree model's output. Based on the following data about an individual, provide a concise analysis and predict their likely overall well-being.

    Individual's Data:
    - Gender: ${formData.gender}, Age: ${formData.age}, Profession: ${formData.profession}
    - Academic Satisfaction: ${formData.academicSatisfaction}/5, CGPA: ${formData.cgpa}
    - Sleep: ${formData.sleepDuration} hrs, Diet: ${formData.dietaryHabits}
    - Suicidal Thoughts: ${formData.suicidalThoughts}, Family History: ${formData.familyHistory}
    - Work/Study Balance: ${formData.workStudyBalance}/5, Financial Status: ${formData.financialStatus}
    - Screen Time: ${formData.screenTime} hrs/day, Physical Activity: ${formData.physicalActivity} hrs/week
    - Self-care Time: ${formData.selfTime} hrs/week, Social Life: ${formData.socialLife}/5

    Provide the prediction in a JSON format. The object must contain:
    1.  "status": A predicted status (Thriving, Balanced, Stressed, or At Risk).
    2.  "reasoning": A brief, supportive, non-clinical paragraph explaining the prediction.
    3.  "wellnessScore": An integer score from 0 to 100 representing overall well-being.
    4.  "yogaSuggestion": An object with "name" and "description" for a simple, helpful yoga pose.
    5.  "musicSuggestion": An object with "genre" and "description" for a type of calming music.

    Do not give medical advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "Predicted status: Thriving, Balanced, Stressed, or At Risk." },
            reasoning: { type: Type.STRING, description: "Brief reasoning for the prediction." },
            wellnessScore: { type: Type.INTEGER, description: "A wellness score from 0 to 100." },
            yogaSuggestion: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
              required: ["name", "description"]
            },
            musicSuggestion: {
              type: Type.OBJECT,
              properties: { genre: { type: Type.STRING }, description: { type: Type.STRING } },
              required: ["genre", "description"]
            }
          },
          required: ["status", "reasoning", "wellnessScore", "yogaSuggestion", "musicSuggestion"]
        }
      }
    });

    const text = response.text.trim();
    const parsedJson = JSON.parse(text);
    return parsedJson as PredictionResultData;

  } catch (error) {
    console.error("Error calling Gemini API for prediction:", error);
    throw new Error("Failed to get a prediction from the AI. The model may be busy, please try again.");
  }
}

export async function getRefinedWellBeingPrediction(formData: FormData, previousPrediction: PredictionResultData): Promise<PredictionResultData> {
  const prompt = `
    As an expert AI analyzing factors related to well-being, you are refining a previous prediction based on updated user data.

    Original Prediction:
    - Status: ${previousPrediction.status}
    - Reasoning: ${previousPrediction.reasoning}
    - Wellness Score: ${previousPrediction.wellnessScore}

    User's Updated Data:
    - Gender: ${formData.gender}, Age: ${formData.age}, Profession: ${formData.profession}
    - Academic Satisfaction: ${formData.academicSatisfaction}/5, CGPA: ${formData.cgpa}
    - Sleep: ${formData.sleepDuration} hrs, Diet: ${formData.dietaryHabits}
    - Suicidal Thoughts: ${formData.suicidalThoughts}, Family History: ${formData.familyHistory}
    - Work/Study Balance: ${formData.workStudyBalance}/5, Financial Status: ${formData.financialStatus}
    - Screen Time: ${formData.screenTime} hrs/day, Physical Activity: ${formData.physicalActivity} hrs/week
    - Self-care Time: ${formData.selfTime} hrs/week, Social Life: ${formData.socialLife}/5

    Your task is to provide a refined analysis. In your reasoning, briefly mention what changed from the previous prediction and why.

    Provide the prediction in the same JSON format as the original. The object must contain:
    1.  "status": A predicted status (Thriving, Balanced, Stressed, or At Risk).
    2.  "reasoning": A brief, supportive paragraph explaining the refined prediction, noting the impact of the user's updates.
    3.  "wellnessScore": An integer score from 0 to 100 representing the new overall well-being.
    4.  "yogaSuggestion": An object with "name" and "description" for a simple, helpful yoga pose.
    5.  "musicSuggestion": An object with "genre" and "description" for a type of calming music.

    Do not give medical advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "Predicted status: Thriving, Balanced, Stressed, or At Risk." },
            reasoning: { type: Type.STRING, description: "Brief reasoning for the refined prediction." },
            wellnessScore: { type: Type.INTEGER, description: "A new wellness score from 0 to 100." },
            yogaSuggestion: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
              required: ["name", "description"]
            },
            musicSuggestion: {
              type: Type.OBJECT,
              properties: { genre: { type: Type.STRING }, description: { type: Type.STRING } },
              required: ["genre", "description"]
            }
          },
          required: ["status", "reasoning", "wellnessScore", "yogaSuggestion", "musicSuggestion"]
        }
      }
    });

    const text = response.text.trim();
    const parsedJson = JSON.parse(text);
    return parsedJson as PredictionResultData;

  } catch (error) {
    console.error("Error calling Gemini API for refined prediction:", error);
    throw new Error("Failed to get a refined prediction from the AI. The model may be busy, please try again.");
  }
}

export async function getImagePromptSuggestion(prediction: PredictionResultData): Promise<string> {
  const prompt = `
    Based on the following user wellness prediction, create a visually rich, metaphorical, and inspiring image prompt for a sophisticated text-to-image AI model (like Midjourney or DALL-E 3). The prompt should be a single, detailed sentence.

    User's Wellness Prediction:
    - Status: ${prediction.status}
    - Reasoning: ${prediction.reasoning}
    - Suggestions: Yoga (${prediction.yogaSuggestion.name}) and Music (${prediction.musicSuggestion.genre}).

    Example: If status is 'Stressed', the prompt could be "A lone figure walking on a path out of a dark, tangled forest into a bright, serene clearing, cinematic lighting, hyperrealistic, hopeful."
    Example: If status is 'Thriving', the prompt could be "A vibrant, bioluminescent garden at twilight with glowing flora and calm energy, digital art, tranquil and magical."

    Generate a creative and artistic prompt that visually represents the user's current state and their potential path towards greater well-being. Respond with only the prompt text, without any labels or quotation marks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // Clean up potential markdown like quotes
    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Error calling Gemini API for image prompt suggestion:", error);
    throw new Error("Failed to get an image prompt suggestion from the AI.");
  }
}

export async function getEmotionFromImage(base64Image: string): Promise<string> {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = {
            text: 'Analyze the primary emotion of the person in this image. Respond with a single word from this list: Happy, Sad, Neutral, Surprised, Angry, Fearful.'
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini Vision API:", error);
        throw new Error("Failed to analyze emotion. The model may be busy.");
    }
}

export async function getEmotionFromSpeech(base64Audio: string, mimeType: string): Promise<string> {
    try {
        const audioPart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Audio,
            },
        };
        const textPart = {
            text: 'Analyze the emotion conveyed in the tone of voice in this audio. Respond with a single word describing the primary emotion, such as: Happy, Sad, Anxious, Calm, Angry, Surprised.'
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for speech analysis:", error);
        throw new Error("Failed to analyze speech emotion. The model may be busy.");
    }
}

export function startChatSession(systemInstruction: string): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
}

export async function getBreathingExercises(): Promise<BreathingExercise[]> {
  const prompt = `
    Generate a list of 3 different breathing exercises for mindfulness and stress relief.
    For each exercise, provide a name, a short description, and a pattern object with inhale, hold, and exhale durations in seconds.
    The "hold" duration can be 0 if there is no hold.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              pattern: {
                type: Type.OBJECT,
                properties: {
                  inhale: { type: Type.INTEGER },
                  hold: { type: Type.INTEGER },
                  exhale: { type: Type.INTEGER },
                },
                required: ["inhale", "hold", "exhale"]
              },
            },
            required: ["name", "description", "pattern"]
          }
        }
      }
    });

    const text = response.text.trim();
    const parsedJson = JSON.parse(text);
    return parsedJson as BreathingExercise[];
  } catch (error) {
    console.error("Error calling Gemini API for breathing exercises:", error);
    throw new Error("Failed to get breathing exercises from the AI. Please try again later.");
  }
}

export async function getMusicRecommendation(mood: string): Promise<MusicGenerationResult> {
  const prompt = `
    As an AI music therapist, a user is feeling: "${mood}".
    Your task is to generate a personalized, soothing soundscape recommendation for them.
    Choose ONE category from this specific list: ["Calm Piano", "Ambient Space", "Nature Sounds", "Lofi Beats"].
    Create a unique, calming title and a short, supportive description for the soundscape.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A unique, calming title for the track." },
            description: { type: Type.STRING, description: "A short, supportive description of the music's intended effect." },
            category: { type: Type.STRING, description: 'Must be one of: "Calm Piano", "Ambient Space", "Nature Sounds", "Lofi Beats".' }
          },
          required: ["title", "description", "category"]
        }
      }
    });

    const text = response.text.trim();
    const parsedJson = JSON.parse(text);
    return parsedJson as MusicGenerationResult;

  } catch (error) {
    console.error("Error calling Gemini API for music recommendation:", error);
    throw new Error("Failed to get a music recommendation from the AI. Please try again.");
  }
}

export async function generateIntroVideo(): Promise<string> {
    const prompt = "A short, welcoming introductory video for an AI Wellness Coach app. The video explains that the AI is a supportive companion for well-being topics like stress management and mindfulness. Use a calm, abstract, and friendly visual style with soothing colors. The tone should be encouraging and empathetic. No text or voiceover is needed.";

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });

        while (!operation.done) {
            // Poll every 10 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was provided.");
        }

        return downloadLink;
    } catch (error) {
        console.error("Error calling Gemini API for video generation:", error);
        throw new Error("Failed to generate the introductory video. Please try again later.");
    }
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const prompt = `
    Analyze the food in this image for a mental wellness app. The tone should be supportive and non-judgmental.
    Provide the output in a JSON format. The object must contain:
    1. "mealName": A short, descriptive name for the meal (e.g., "Avocado Toast with Egg").
    2. "calories": An estimated integer value for the total calories.
    3. "classification": Classify the meal as "Healthy", "Moderate", or "Unhealthy".
    4. "score": An integer score from 1 to 10, where 10 is healthiest.
    5. "reasoning": A brief, single-sentence explanation for the score and classification.
    6. "mentalWellnessInsight": A short, encouraging insight on how this type of meal can affect mood, energy, or stress. Focus on the positive aspects if possible.
  `;

  try {
    const imagePart = {
      inlineData: { mimeType: 'image/jpeg', data: base64Image },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: { type: Type.STRING },
            calories: { type: Type.INTEGER },
            classification: { type: Type.STRING, enum: ["Healthy", "Moderate", "Unhealthy"] },
            score: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
            mentalWellnessInsight: { type: Type.STRING },
          },
          required: ["mealName", "calories", "classification", "score", "reasoning", "mentalWellnessInsight"],
        },
      },
    });

    const text = response.text.trim();
    return JSON.parse(text) as FoodAnalysisResult;
  } catch (error) {
    console.error("Error calling Gemini API for food analysis:", error);
    throw new Error("Failed to analyze the food image. The model may be busy, please try again.");
  }
}


export async function generateImage(prompt: string, style: string, aspectRatio: '1:1' | '16:9' | '9:16', negativePrompt: string): Promise<string> {
    // The `negativePrompt` parameter is not supported by the API.
    // It is incorporated into the main prompt to preserve functionality.
    let fullPrompt = `${prompt}, in a ${style} style`;
    if (negativePrompt?.trim()) {
        fullPrompt += `. Avoid the following elements: ${negativePrompt}`;
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio,
            },
        });

        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) {
            throw new Error("Image generation succeeded but returned no data. This may be due to the prompt violating safety policies.");
        }
        return base64ImageBytes;
    } catch (error: any) {
        console.error("Error calling Gemini API for image generation:", error);
        
        if (error.message.includes("safety policies")) {
            throw error;
        }

        let userMessage = "Failed to generate the image. The model may be busy or the prompt could be unsuitable. Please try again.";

        // Attempt to parse a JSON error message, which is common for API errors
        try {
            // The actual error message from the API might be a JSON string inside error.message
            const errorJson = JSON.parse(error.message);
            const nestedMessage = errorJson?.error?.message?.toLowerCase() || '';

            if (nestedMessage.includes('quota')) {
                userMessage = "API quota exceeded. Please check your plan or try again later.";
            } else if (nestedMessage.includes('safety') || nestedMessage.includes('blocked')) {
                userMessage = "Your prompt may have violated the safety policy. Please modify it and try again.";
            } else if (nestedMessage.includes('api key not valid')) {
                userMessage = "The API key is invalid. Please check your configuration.";
            }
        } catch (e) {
            // If parsing fails, it's not a JSON string. Fallback to simple string search.
            const errorMessage = (error.message || '').toLowerCase();
            if (errorMessage.includes('quota')) {
                userMessage = "API quota exceeded. Please check your plan or try again later.";
            } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                userMessage = "Your prompt may have violated the safety policy. Please modify it and try again.";
            } else if (errorMessage.includes('api key not valid')) {
                userMessage = "The API key is invalid. Please check your configuration.";
            }
        }

        throw new Error(userMessage);
    }
}

export async function getJournalPrompt(): Promise<string> {
    const prompt = `
        As an AI wellness coach, generate a single, concise, and thought-provoking journal prompt.
        The prompt should be designed to help someone who is feeling anxious or is overthinking.
        It should encourage self-reflection in a gentle, non-overwhelming way.
        Respond with only the prompt text, no extra formatting or quotation marks.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting journal prompt:", error);
        throw new Error("Failed to get a journal prompt. Please try again.");
    }
}

export async function getJournalReflection(entry: string): Promise<string> {
    const prompt = `
        As an AI wellness coach, you are reading a user's journal entry. Your task is to provide a brief, supportive, and insightful reflection on their writing.
        - Do not give direct advice.
        - Acknowledge their feelings and validate their experience.
        - Gently highlight a key theme or a point of strength you noticed.
        - End with an encouraging and calming thought.
        - Keep the reflection concise, around 2-3 sentences.

        User's journal entry:
        ---
        ${entry}
        ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting journal reflection:", error);
        throw new Error("Failed to get a reflection. Please try again.");
    }
}