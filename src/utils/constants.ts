
import { Language } from "@/types";

export const LANGUAGES: { id: Language; label: string; region: string }[] = [
  { id: "english", label: "English", region: "Global" },
  { id: "hindi", label: "हिन्दी (Hindi)", region: "Indo-Aryan" }
];

export const MOODS = [
  "Calm",
  "Anxious",
  "Happy",
  "Sad",
  "Crying",
  "Confused",
  "Motivated",
  "Fearful",
  "Grateful",
  "Peaceful",
  "Energetic",
  "Grief"
];

export const GOALS = [
  "Peace",
  "Wisdom",
  "Self-discovery",
  "Strength",
  "Prosperity",
  "Health",
  "Relationship",
  "Career",
  "Spiritual growth",
  "Letting go"
];

export const PLACEHOLDER_VERSE = {
  id: "1",
  chapter: 2,
  verse: 47,
  text: {
    english: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.",
    hindi: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
  },
  meaning: {
    english: "You have the right to work only, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction. This verse teaches us to do our duty without expectation of results.",
    hindi: "आपको केवल कर्म करने का अधिकार है, फल का नहीं। कभी भी अपने कर्मों के फलों का कारण मत बनो, और न ही अकर्म में आसक्त रहो। यह श्लोक हमें सिखाता है कि हमें परिणामों की अपेक्षा के बिना अपना कर्तव्य करना चाहिए।",
  }
};

export const PREMIUM_PRICE = "$7/month";
