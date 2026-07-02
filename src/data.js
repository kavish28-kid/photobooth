export const scenes = ["Hero", "Process", "Booth", "Filters", "Pricing", "Close"];

export const processSteps = [
  ["01", "Open the link", "No app, no download. Anyone with the session link steps into the booth from their own camera."],
  ["02", "Strike a pose", "A three-count and a real flash - timed so everyone lands the shot together, even on different screens."],
  ["03", "Pick a filter", "From true-to-life to full grain-and-light-leak film stock, previewed live before you commit."],
  ["04", "Print & share", "A film-strip render lands in everyone's hands in seconds - save it, send it, or mail a real print."]
];

export const filters = [
  ["Kodalux", "WARM - GRAIN 3", "linear-gradient(140deg,#5a3a2a,#2c1a1c)", 18],
  ["Noir Roll", "B&W - CONTRAST HIGH", "linear-gradient(140deg,#151515,#4b5563)", 2],
  ["Aurora", "COOL - LEAK SOFT", "linear-gradient(140deg,#1f3b68,#5b2c7a)", 34],
  ["Coral Fade", "WARM - FADE 40%", "linear-gradient(140deg,#5a2430,#fb7185)", 10],
  ["Midnight", "COOL - GRAIN 5", "linear-gradient(140deg,#141428,#1c2c3a)", 28],
  ["True Light", "NEUTRAL - CLEAN", "linear-gradient(140deg,#3f3f46,#a1a1aa)", 6],
  ["Wrapped", "DUO - CYAN/CORAL", "linear-gradient(140deg,#22d3ee,#fb7185)", 22]
];

export const quotes = [
  ["Every print landed in the group chat before the toast ended.", "Reception, 140 guests"],
  ["The flash timing is what sold me. It actually feels like a countdown.", "Studio Nine, event co."],
  ["Set it up for a product launch in eleven minutes.", "Marketing lead"],
  ["Grandma joined from her tablet and got the same countdown.", "Family reunion, 60th"],
  ["Filter previews update live enough that no one argues.", "Friend group, weekly ritual"]
];

export const plans = [
  ["Casual", "Drop-in", "$0", "/session", ["Up to 8 guests", "3 core filters", "Digital film strip", "Session link, 24hr"], "Start free", false],
  ["Most booked", "Occasion", "$29", "/event", ["Unlimited guests", "Full filter library", "Custom print border & branding", "Session link, 30 days", "Real print mail-out (US)"], "Book the booth", true],
  ["Recurring", "Studio", "$79", "/month", ["Unlimited events", "Custom filters & presets", "Team seats & analytics", "Priority render queue"], "Talk to us", false]
];

export const faqs = [
  ["Do guests need to install anything?", "No. The session link opens straight in the browser on any phone, tablet, or laptop - front camera, no download."],
  ["How many people can join one booth?", "The free tier holds 8 guests per session. Occasion and Studio plans remove the cap entirely."],
  ["Can we get real printed copies?", "Yes - the Occasion plan includes a real print mail-out within the US, styled exactly like the digital film strip."],
  ["What happens to the photos afterward?", "Every guest can save their own copies during the session window. After it closes, files are removed from our servers unless you've upgraded storage."]
];
