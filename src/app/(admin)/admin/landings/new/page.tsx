import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { LandingBuilderPreview } from "@/components/admin/builder/LandingBuilderPreview";
import { LandingBuilderReadiness } from "@/components/admin/builder/LandingBuilderReadiness";
import { LandingBuilderShell } from "@/components/admin/builder/LandingBuilderShell";
import { LandingBuilderStepper } from "@/components/admin/builder/LandingBuilderStepper";
import { LandingConversionStep } from "@/components/admin/builder/LandingConversionStep";
import { LandingHeroStep } from "@/components/admin/builder/LandingHeroStep";
import { LandingMarketStep } from "@/components/admin/builder/LandingMarketStep";
import { LandingOfferStep } from "@/components/admin/builder/LandingOfferStep";
import { LandingProofStep } from "@/components/admin/builder/LandingProofStep";
import { LandingSeoStep } from "@/components/admin/builder/LandingSeoStep";
import LandingEditor from "@/components/admin/growth/LandingEditor";
import { createLandingBuilderDefaults } from "@/lib/admin/builder/landing-builder-defaults";
import { computeLandingBuilderReadiness } from "@/lib/admin/builder/landing-builder-readiness";
import builderStyles from "@/components/admin/builder/LandingBuilder.module.css";
import { createLandingFromBuilderAction } from "./actions";

export const metadata: Metadata = { title: "Nouvelle page locale — TMS Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

const TEMPLATE_OPTIONS = [
  { value: "MOBILE_WHATSAPP_FIRST", label: "Séance WhatsApp mobile-first" },
  { value: "PREMIUM_PRIVATE_SESSION", label: "Séance premium" },
  { value: "B2B_HOSPITALITY", label: "Hôtel / partenaire" },
  { value: "FORMATION_LEADGEN", label: "Formation" },
  { value: "SEO_LOCAL_SERVICE", label: "SEO local" },
  { value: "EVENT_WORKSHOP", label: "Workshop" },
] as const;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewLandingPage({ searchParams }: PageProps) {
  await ensureAdminSchema();

  const params = searchParams ? await searchParams : {};
  const error = one(params.error);

  const [destinations, offers, channels, tracking, crmRules, mediaAssets, testimonials] = await Promise.all([
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ orderBy: { internalName: "asc" } }),
    prisma.whatsappChannel.findMany({ orderBy: { label: "asc" } }),
    prisma.trackingProfile.findMany({ orderBy: { label: "asc" } }),
    prisma.crmRoutingRule.findMany({ orderBy: { priority: "asc" } }),
    prisma.mediaAsset.findMany({
      where: { assetType: { in: ["IMAGE", "POSTER"] } },
      orderBy: { filename: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { status: { in: ["READY", "LIVE"] } },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      select: { id: true, displayName: true, locale: true, city: true },
    }),
  ]);

  const builderDraft = createLandingBuilderDefaults();
  const readiness = computeLandingBuilderReadiness(builderDraft);

  return (
    <LandingBuilderShell
      title="Nouvelle page locale"
      description="Builder guidé : crée un brouillon exploitable sans passer par le JSON expert."
      sidebar={
        <>
          <LandingBuilderStepper />
          <LandingBuilderReadiness score={readiness.score} issues={readiness.issues} />
        </>
      }
    >
      <form action={createLandingFromBuilderAction} className={builderStyles.form}>
        {error === "duplicate" ? (
          <div className={builderStyles.error}>
            Une page existe déjà avec cette langue et ce slug. Choisis un slug différent.
          </div>
        ) : null}

        <LandingMarketStep>
          <div className={builderStyles.fieldGrid}>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Destination</span>
              <select name="destinationId" required defaultValue="" className={`admin-input ${builderStyles.select}`}>
                <option value="" disabled>
                  Choisir une destination
                </option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.displayNameFr || destination.cityName} · {destination.country}
                  </option>
                ))}
              </select>
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Langue</span>
              <select name="locale" defaultValue={builderDraft.market.locale} className={`admin-input ${builderStyles.select}`}>
                <option value="FR">FR</option>
                <option value="EN">EN</option>
                <option value="ES">ES</option>
              </select>
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Slug public</span>
              <input
                name="slug"
                required
                placeholder="reset-corporal-frances-cdmx"
                className={`admin-input ${builderStyles.input}`}
              />
              <span className={builderStyles.help}>La page sera créée en brouillon et accessible dans l’éditeur.</span>
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Template</span>
              <select name="template" defaultValue={builderDraft.market.template} className={`admin-input ${builderStyles.select}`}>
                {TEMPLATE_OPTIONS.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </LandingMarketStep>

        <LandingOfferStep>
          <div className={builderStyles.fieldGrid}>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Offre</span>
              <select name="offerId" defaultValue="" className={`admin-input ${builderStyles.select}`}>
                <option value="">Aucune offre liée</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.publicNameFr || offer.internalName}
                  </option>
                ))}
              </select>
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Canal WhatsApp</span>
              <select name="whatsappChannelId" defaultValue="" className={`admin-input ${builderStyles.select}`}>
                <option value="">À configurer plus tard</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.label} · {channel.status}
                  </option>
                ))}
              </select>
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Profil tracking</span>
              <select name="trackingProfileId" defaultValue="" className={`admin-input ${builderStyles.select}`}>
                <option value="">À configurer plus tard</option>
                {tracking.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label} · {profile.status}
                  </option>
                ))}
              </select>
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Routage GHL</span>
              <select name="crmRoutingRuleId" defaultValue="" className={`admin-input ${builderStyles.select}`}>
                <option value="">Routage par défaut</option>
                {crmRules.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    Priorité {rule.priority} · {rule.leadSegment || rule.intent || rule.source || rule.status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </LandingOfferStep>

        <LandingHeroStep>
          <div className={builderStyles.fieldGrid}>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Titre hero</span>
              <input
                name="heroTitle"
                required
                placeholder="Reset corporel français à Mexico City"
                className={`admin-input ${builderStyles.input}`}
              />
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Sous-titre hero</span>
              <textarea
                name="heroSubtitle"
                placeholder="Explique la promesse locale, le public visé et le bénéfice principal."
                className={`admin-input ${builderStyles.textarea}`}
              />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Micro-note</span>
              <input name="microNote" placeholder="Réponse WhatsApp rapide" className={`admin-input ${builderStyles.input}`} />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>CTA principal</span>
              <input
                name="primaryCta"
                required
                defaultValue={builderDraft.hero.primaryCta}
                className={`admin-input ${builderStyles.input}`}
              />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>CTA secondaire</span>
              <input
                name="secondaryCta"
                defaultValue={builderDraft.hero.secondaryCta}
                className={`admin-input ${builderStyles.input}`}
              />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Image hero</span>
              <select name="heroImageId" defaultValue="" className={`admin-input ${builderStyles.select}`}>
                <option value="">Fallback public par défaut</option>
                {mediaAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.originalName || asset.filename} · {asset.assetType}
                  </option>
                ))}
              </select>
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Alt image CMS</span>
              <input
                name="imageAlt"
                placeholder="Description courte si l’image est réutilisée en SEO ou partage social"
                className={`admin-input ${builderStyles.input}`}
              />
            </label>
          </div>
        </LandingHeroStep>

        <LandingProofStep>
          <div className={builderStyles.fieldGrid}>
            <div className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Badges de preuve</span>
              {[1, 2, 3].map((index) => (
                <div key={index} className={builderStyles.inlineGrid}>
                  <input
                    name={`proofBadge${index}Value`}
                    placeholder={`Valeur ${index} : 10+ ans`}
                    className={`admin-input ${builderStyles.input}`}
                  />
                  <input
                    name={`proofBadge${index}Label`}
                    placeholder={`Label ${index} : d'expérience`}
                    className={`admin-input ${builderStyles.input}`}
                  />
                </div>
              ))}
            </div>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Pain chips</span>
              <textarea name="painChips" placeholder="Dos bloqué&#10;Nuque tendue" className={`admin-input ${builderStyles.textarea}`} />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Étapes du process</span>
              <textarea name="processSteps" placeholder="Diagnostic rapide&#10;Séance ciblée&#10;Suivi WhatsApp" className={`admin-input ${builderStyles.textarea}`} />
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Témoignages</span>
              <select name="testimonialIds" multiple size={Math.min(Math.max(testimonials.length, 3), 6)} className={`admin-input ${builderStyles.select}`}>
                {testimonials.map((testimonial) => (
                  <option key={testimonial.id} value={testimonial.id}>
                    {testimonial.displayName} · {testimonial.locale}
                    {testimonial.city ? ` · ${testimonial.city}` : ""}
                  </option>
                ))}
              </select>
              <span className={builderStyles.help}>Ctrl/Cmd + clic pour sélectionner plusieurs témoignages.</span>
            </label>
          </div>
        </LandingProofStep>

        <LandingConversionStep>
          <div className={builderStyles.fieldGrid}>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Segment lead</span>
              <input name="leadSegment" defaultValue={builderDraft.conversion.leadSegment} className={`admin-input ${builderStyles.input}`} />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Titre formulaire</span>
              <input name="formHeadline" defaultValue={builderDraft.conversion.formHeadline} className={`admin-input ${builderStyles.input}`} />
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Options urgence</span>
              <textarea
                name="urgencyOptions"
                placeholder="today|Aujourd'hui&#10;week|Cette semaine"
                className={`admin-input ${builderStyles.textarea}`}
              />
              <span className={builderStyles.help}>Format : value|label, une option par ligne.</span>
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Texte conformité</span>
              <textarea
                name="complianceText"
                placeholder="Message optionnel de consentement ou précision médicale."
                className={`admin-input ${builderStyles.textarea}`}
              />
            </label>
          </div>
        </LandingConversionStep>

        <LandingSeoStep>
          <div className={builderStyles.fieldGrid}>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Titre SEO</span>
              <input name="seoTitle" placeholder="Reset corporel français à CDMX" className={`admin-input ${builderStyles.input}`} />
            </label>
            <label className={builderStyles.field}>
              <span className={builderStyles.label}>Canonical</span>
              <input name="canonical" placeholder="https://reboutementmassage.com/es/..." className={`admin-input ${builderStyles.input}`} />
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Meta description</span>
              <textarea
                name="metaDescription"
                placeholder="Description claire, locale et orientée conversion."
                className={`admin-input ${builderStyles.textarea}`}
              />
            </label>
            <label className={builderStyles.checkboxRow}>
              <input type="hidden" name="noindex" value="true" />
              <input type="checkbox" checked disabled readOnly />
              Brouillon noindex forcé à la création
            </label>
            <label className={builderStyles.checkboxRow}>
              <input type="checkbox" name="xDefault" />
              Marquer comme x-default du groupe hreflang
            </label>
            <label className={builderStyles.fieldWide}>
              <span className={builderStyles.label}>Groupe hreflang</span>
              <input name="hreflangGroupId" placeholder="cdmx-reset-corporal" className={`admin-input ${builderStyles.input}`} />
            </label>
          </div>
        </LandingSeoStep>

        <div className={builderStyles.actions}>
          <button type="submit" className="admin-btn admin-btn--primary">
            Créer le brouillon
          </button>
          <span className={builderStyles.help}>La page restera en DRAFT et noindex. La publication se fait depuis l’éditeur.</span>
        </div>
      </form>

      <LandingBuilderPreview value={builderDraft} />

      <details className={builderStyles.expert}>
        <summary className={`admin-btn admin-btn--ghost ${builderStyles.expertSummary}`}>
          Ouvrir le mode expert
        </summary>
        <LandingEditor
          destinations={destinations}
          offers={offers}
          channels={channels}
          tracking={tracking}
          crmRules={crmRules}
          mediaAssets={mediaAssets}
        />
      </details>
    </LandingBuilderShell>
  );
}
