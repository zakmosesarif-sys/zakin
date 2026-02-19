import { GoogleGenAI } from "@google/genai";
import { LocationData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scoutLocation(query: string): Promise<LocationData> {
  try {
    const model = 'gemini-2.5-flash';
    
    // We want to find a real location to use as the "Mission Target"
    // We use the googleMaps tool to ensure the location exists and get metadata.
    const response = await ai.models.generateContent({
      model,
      contents: `Find a real-world location matching this request for a fictional heist game: "${query}". 
      If the user asks for a city, find a famous bank, museum, or jewelry store there.
      Return a short description of why this is a good target.`,
      config: {
        tools: [{ googleMaps: {} }],
        // We don't use JSON schema here because we want to parse the grounding metadata specifically
        // and the text might be conversational. We will extract what we need.
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let mapUri = "";
    let name = "Unknown Location";
    let address = "Unknown Address";
    
    // Extract map data if available
    if (groundingChunks && groundingChunks.length > 0) {
      // Prioritize chunks that have map data
      // Check for 'maps' property as per guidelines, fallback to 'web' if needed
      const mapChunk = groundingChunks.find((c: any) => c.maps?.uri || c.web?.uri) || groundingChunks[0];
      
      // The structure of grounding chunks can vary slightly between search and maps.
      // For googleMaps tool, the property is 'maps'.
      if (mapChunk.maps) {
          mapUri = mapChunk.maps.uri;
          name = mapChunk.maps.title;
      } else if (mapChunk.web) {
          mapUri = mapChunk.web.uri;
          name = mapChunk.web.title;
      }
    }

    // Use the text as description
    const description = response.text || "A high value target identified by the network.";

    return {
      name,
      address,
      mapUri,
      description
    };
  } catch (error) {
    console.error("Gemini Scout Error:", error);
    return {
      name: "Local Bank",
      address: "Downtown",
      description: "Connection to satellite failed. Running local simulation.",
      mapUri: ""
    };
  }
}