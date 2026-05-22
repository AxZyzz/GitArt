# GitArt — TODO

## Bugs (fix now)
- [x] TemplateGallery preview: hardcoded `repeat(52, ...)` breaks 53-col grid (all previews misaligned)
- [x] `toISO()` uses `.toISOString()` (UTC) — dates shift 1 day for UTC+ users (India = IST +5:30)
- [x] Remove bash script generator — keep Node.js only

## Templates
- [x] Expand to 53 columns (done)
- [x] Full A-Z pixel font (done)
- [x] Text Generator section (done)
- [ ] Add new creative templates: Heartbeat, DNA, Mountains, Rocket
- [ ] Template: Skull
- [ ] Template: Crown

## Features
- [ ] Supabase integration — email capture on export (T&C accept + newsletter opt-in)
- [ ] GitHub star button (link to AxZyzz/GitArt)
- [ ] Terms & Conditions modal before download
- [ ] User email → stored in Supabase for updates
- [ ] Preview mode: show what the graph will look like on GitHub profile
- [ ] More number/symbol support in pixel font

## Hosting
- [ ] Deploy to Vercel / Netlify
- [ ] Custom domain

## Cleanup
- [x] .gitignore: exclude .claude/, node_modules/, dist/
- [ ] Update README with correct repo URL (AxZyzz/GitArt)
- [ ] Remove `</>` emoji placeholder in footer GitHub link
