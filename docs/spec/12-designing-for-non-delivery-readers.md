# 12 - Designing for people who do not know what good delivery looks like

Supersedes the content assumptions in docs 10 and 11. The navigation and repositioning stand. What
changes is who the writing is for.

The clickable source is the Next.js app. A static prototype informed this spec; the live teaching layer, Roles section, figures and walkthrough are the implementation.

---

## 1. The assumption that was wrong

Docs 07 to 11 were written for a reader who already knows what a delivery manager does, why a squad
needs a service designer, and what an assessment panel is looking for. That reader exists, but they
are not the person struggling to navigate the product.

The actual user is a client-side programme lead, a commissioning manager, a finance business partner,
or a T&T director from a non-digital discipline. They are perfectly capable and they are being asked
to make a decision about a delivery team without ever having sat in one. For that person, a fit score
of 0.58 is not information. It is a number attached to a judgement they have no way to check.

**A measurement instrument is useless to someone who does not hold the standard it measures against.**
That is the whole problem, and it explains the navigation complaints better than the navigation does.
People say a product is hard to navigate when they cannot predict what they will find, and they cannot
predict it when they do not understand the domain it is organised around.

So the product has to teach first. Not as a help centre bolted on the side, but as the first thing on
every page.

---

## 2. The teaching layer

Built into the product as the teaching layer on every primary section.

**Explain as I go, on by default, dismissible.** A toggle in the left rail controls a set of
explanatory panels that sit above the data on every page. On for a new user, off once they know their
way around, and the setting persists. Two audiences, one build, and the expert never has to scroll
past something they already know.

The panels follow a fixed shape, which matters more than it sounds. Every one answers the same three
questions in the same order: what am I looking at, why does it matter, and what goes wrong. Once a
reader has met that pattern twice they stop reading the ones they do not need, which is the point.

**A new Roles section, ahead of People.** Nine cards, each with three lines: what the role is for,
what goes wrong without it, and what it is commonly mistaken for. The third line is the one that earns
its place. Most people can approximate what a role does. The expensive mistakes come from confusing a
service designer with a visual designer, or a delivery manager with a project manager, and those
mistakes take about a month to become visible.

It sits second in the navigation, before People, because you cannot judge whether somebody fits a role
until you know what the role is.

---

## 3. Visuals, and what each one is for

Six figures, one per concept, each doing a job no table can do. All are inline SVG: server renderable,
no chart library, printable, and legible at board-pack size.

**Figure 1, empowered against matrixed.** The same five people arranged two ways: one team with one
problem and the authority to decide, against five individuals on loan each answering to a different
manager. This is the single most important image in the product, because it makes the abstract idea of
an autonomous team concrete in about two seconds. The accompanying test is deliberately blunt: can this
team put something in front of real users this week without asking anyone outside it for permission? If
not, it is not empowered, and no quantity of stand-ups will change that.

**Figure 2, two clocks.** The delivery lifecycle with governance gates beneath it. Teaches that the
team's rhythm and the governance rhythm are separate, meet at phase ends, and stay out of each other's
way in between. This is where non-digital readers most often go wrong, usually by asking a squad to
stop and prepare for a gate.

**Figure 3, the capacity split.** A single bar, 70/20/10. Teaches that a full-time person is not five
days of new work. It exists to defuse the most common client challenge, which is why they are paying
for a full-time person who is not delivering full-time.

**Figure 4, continuity.** One row per person, four phases across, filled blocks where they stayed with
one engagement. This is The Keel made visible, and it is the figure that changes minds. Somebody can
argue with the assertion that stable teams deliver better. It is much harder to argue with their own
allocation history laid out in a row.

**Figure 5, squad shape.** Circles sized by how much of a person each role needs, dashed where unfilled,
amber where filled but below the datum. The amber state carries the teaching: a role filled by somebody
below the line looks solved on a spreadsheet and is more dangerous than an empty seat precisely because
nobody is worried about it.

**Figure 6, demand against capability.** Paired bars across the portfolio. Teaches the difference
between a staffing problem and a capability problem, which is the difference between hiring a
contractor and changing what the practice can do.

---

## 4. The walkthrough

Eight steps, and it now *does* something rather than showing finished screens. Steps five to seven
build a squad live: roles start empty, get filled, and the shape diagram, the health figures and the
readiness assessment all move as they do.

The order:

1. What an empowered team is, with the two-shapes figure
2. The two clocks, and what happens when they get squeezed together
3. The roles, in plain English
4. Who we hold, and the difference between free and stable
5. An empty squad, and why you start from the role rather than from who is free
6. Three roles filled, and what filled-but-weak looks like
7. Somebody with no evidence recorded, and the unevidenced rule stated plainly
8. What all of it means for the assessment

Step 7 is the one to rehearse. It is where a sceptical client will push, and the answer has to be
delivered without hedging: when we hold no delivery evidence about somebody, their multiplier stays at
exactly 1.00, and that is a gap in our records rather than a mark against them. Said clearly, it is the
most credible thing in the product. Said vaguely, it sounds like a euphemism.

---

## 5. Language rules

The register changed and it should stay changed. Specifics, because these are the ones that were
getting through:

| Instead of | Write |
|---|---|
| Rigour multiplier | What we have seen them do |
| Unevidenced candidate | Nothing recorded |
| Composite score 0.58, stretch band | 0.58, below the datum, assign only with a stated reason |
| Capacity constrained | Not enough free time |
| Criticality: core | Cannot run without |
| Derived signal | From our records |
| Asserted signal | Recorded by a person |
| Preparedness Index | Whether this team will pass |

The pattern: name the thing by what it means to the reader, not by what the schema calls it. The
schema names stay in the schema.

Two rules that survive from doc 11 and matter more here, not less. Never use "resource" to mean a
person. And no claim on a page that cannot be shown on screen within two clicks, because a reader who
does not know the domain cannot tell a claim from a fact, which puts the whole burden on us not to
blur the two.

---

## 6. What I would test before building this

Three things, and they are cheap.

**Show figure 1 to five people who do not work in delivery and ask them to explain it back.** If the
empowered-against-matrixed distinction does not survive being explained back, nothing downstream of it
will land either. This is the load-bearing image and it is worth knowing early if it fails.

**Watch someone use the walkthrough without narration.** The current demo works because a presenter
fills the gaps. The test is whether it works when nobody does.

**Ask a client-side reader what a 0.58 means and what they would do about it.** If they cannot answer
the second part, the score is decoration however accurate it is. The band descriptions exist to make
that answerable, and they should be tested rather than assumed.
