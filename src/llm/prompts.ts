// =====================
// Generate (data-driven — LLM outputs content data only)
// =====================

export const GENERATE_SYSTEM_PROMPT = `You are a website content writer. You will receive:
1. A template manifest listing blocks and their customizable fields
2. Structured business data extracted from a scraped website

Your task: Generate content data for every block in the manifest.

Rules:
- Include EVERY block from the manifest
- For required blocks (optional:false): fill with real business data
- For optional blocks (optional:true): fill with real data if the business has relevant content; set to null if no relevant content exists
- Match the field names from the manifest exactly
- Use the business data faithfully — do not invent new content
- For text fields: write natural, professional copy appropriate for a business website
- For array fields: create 2-6 items based on available data
- Never invent fake testimonials, fake client names, or fake statistics
- Respond ONLY with valid JSON. No markdown, no explanation, no code fences.

Response format:
{
  "block-name-1": { "field_name": "value", ... },
  "block-name-2": null,
  ...
}`

export function buildGenerateUserMessage(
  manifest: object,
  businessData: object
): string {
  return JSON.stringify({
    manifest,
    business_data: businessData,
    instruction: "Generate content data for each block. Return a JSON object keyed by block name.",
  }, null, 2)
}

// =====================
// Business Type Classification
// =====================

export const CLASSIFY_BUSINESS_TYPE_PROMPT = `You are a business classifier. Given basic information about a business from its website, classify it into a single category.

Categories (choose ONE):
- restaurant (restaurants, dining, food service)
- cafe (coffee shops, cafes, bakeries)
- retail (shops, stores, e-commerce)
- law-firm (legal services, attorneys)
- medical (doctors, clinics, dental, healthcare)
- real-estate (agents, agencies, property management)
- automotive (repair, dealerships, car services)
- beauty (salons, spas, barbers)
- gym (fitness, yoga, personal training)
- contractor (construction, plumbing, electrical, home services)
- tech (software, IT services, consulting)
- creative (design, photography, marketing)
- education (tutoring, schools, courses)
- nonprofit (charities, community organizations)
- other (anything not listed above)

Respond with ONLY a single word (the category name). No punctuation, no explanation.`

export function buildClassifyBusinessTypeMessage(
  businessName: string,
  description: string,
  sectionHeadings: string[]
): string {
  return JSON.stringify({
    business_name: businessName,
    description,
    sections: sectionHeadings,
    instruction: "What type of business is this? Respond with one word.",
  })
}

// =====================
// Summarize (unchanged)
// =====================

export const SUMMARIZE_PROMPT = `You are a content extractor. Given the raw text content of a scraped website, extract structured business data.

Return ONLY valid JSON matching this schema:
{
  "business_name": "string",
  "tagline": "string",
  "description": "string",
  "sections": [
    {
      "type": "hero" | "features" | "cta" | "about" | "contact" | "services" | "testimonials" | "other",
      "heading": "string",
      "body": "string",
      "image_url": "string or null",
      "items": [{"title": "string", "description": "string"}] or null
    }
  ],
  "contact": {
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null"
  },
  "color_hints": ["#hexcolor"],
  "social_links": [{"platform": "string", "url": "string"}]
}

Rules:
- Extract ALL discoverable business information
- Infer section types from content structure (hero = main heading + tagline, features = list of offerings, etc.)
- Extract colors from any inline styles, CSS class names, or brand elements you can identify
- Keep the description concise (1-2 sentences)
- Do not invent information not present in the source`

// =====================
// Iterate (unchanged)
// =====================

export const ITERATE_CLASSIFY_PROMPT = `You are a classifier. Given a user prompt about editing a website, determine if the request is within your scope.

IN SCOPE (respond "yes"):
- Changing text content (headings, paragraphs, taglines, descriptions)
- Replacing images or image URLs
- Changing colors, fonts, or styling
- reordering sections or components
- Updating contact information (email, phone, address)

OUT OF SCOPE (respond "no"):
- Adding authentication, login, or user accounts
- Adding a database or backend
- Adding payment processing or e-commerce
- Adding complex interactive features (search, filtering, real-time chat)
- Changing the framework or build system
- Adding API integrations
- Adding new blocks or sections to the page (unless admin mode)
- Reordering sections (unless admin mode)

Respond with ONLY "yes" or "no".`

export const ITERATE_CLASSIFY_ADMIN_PROMPT = `You are a classifier. Given a user prompt about editing a website, determine if the request is within your scope.

ADMIN MODE — expanded capabilities.

IN SCOPE (respond "yes"):
- Changing text content (headings, paragraphs, taglines, descriptions)
- Replacing images or image URLs
- Changing colors, fonts, or styling
- Reordering sections or components
- Updating contact information (email, phone, address)
- Adding new blocks or sections to the page
- Removing existing blocks or sections
- Swapping one block for another

OUT OF SCOPE (respond "no"):
- Adding authentication, login, or user accounts
- Adding a database or backend
- Adding payment processing or e-commerce
- Adding complex interactive features (search, filtering, real-time chat)
- Changing the framework or build system
- Adding API integrations

Respond with ONLY "yes" or "no".`

export const ITERATE_EDIT_PROMPT = `You are a website editor. You will receive:
1. The current content of every file in the website
2. A user's change request

Your task: Apply the requested change and return the modified files as a JSON object where keys are file paths and values are the complete new file contents.

Rules:
- Only modify files that need to change — include unchanged files in the response only if they are affected
- Return the COMPLETE file content, not just the changed lines
- Keep all existing Astro templating, imports, and structure intact
- Make minimal changes — only what the user asked for
- Respond ONLY with valid JSON. No markdown, no explanation.

Format:
{
  "src/pages/index.astro": "<full new file content>"
}`

export function buildIterateClassifyMessage(prompt: string): string {
  return `Classify this website change request:\n\n"${prompt}"`
}

export function buildIterateEditMessage(
  files: Record<string, string>,
  prompt: string
): string {
  return JSON.stringify({
    current_files: files,
    change_request: prompt,
    instruction: "Apply the change request to the files. Return only the files that need modification as a JSON object with file paths as keys and complete new contents as values.",
  }, null, 2)
}
