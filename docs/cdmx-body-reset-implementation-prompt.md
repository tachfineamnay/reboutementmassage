# Prompt d’implémentation — Landing CDMX Body Reset

Tu es sur le repo `tachfineamnay/reboutementmassage`.

Objectif : intégrer le nouveau copywriting CDMX Body Reset dans la landing existante, adapter le formulaire et ajouter des CTA WhatsApp Mexico cohérents.

## Source copywriting

Utilise comme source :

`docs/cdmx-body-reset-copywriting-es-mx.md`

Ne repars pas de l’ancien wording générique “75-min French Body Reset session”. La nouvelle page doit présenter clairement deux offres :

1. `Body Reset Fix`
   - séance privée ponctuelle ;
   - tension claire, zone prioritaire ou corps chargé ;
   - première expérience simple ;
   - CTA : `Reservar Body Reset Fix`.

2. `French Body Reset Full`
   - protocole complet en 3 séances ;
   - lecture corporelle, travail manuel précis, intégration, suivi post-reset, orientation personnalisée ;
   - CTA : `Consultar el protocolo Full`.

## Langue

La landing principale CDMX doit être en espagnol mexicain naturel.

## Routes concernées

Routes canoniques Growth CMS attendues :

- `/es/reset-corporal-frances-cdmx`
- `/en/mexico-city-french-body-reset`
- `/fr/french-body-reset-mexico-city`

La priorité d’intégration est ES-MX.

Les routes legacy doivent rester redirigées ou compatibles :

- `/es/sesion-privada-cdmx`
- `/en/mexico-city-private-session`
- `/fr/seance-privee-mexico-city`

## Fichiers probables à modifier

- `src/data/campaign-landings.ts`
- composants de campagne dans `src/components/campaign/*`
- composant formulaire utilisé par la landing CDMX
- éventuellement seed CDMX : `prisma/seed-growth-cdmx.ts`

## Hero attendu

Eyebrow : `Sesiones privadas en CDMX`

H1 : `Body Reset — CDMX`

Sous-titre :
`Una sesión privada para soltar tensiones y recuperar un cuerpo más libre.`

Texte d’appui :
`No es un masaje clásico. Es una experiencia manual precisa, personalizada y de inspiración francesa para escuchar tu cuerpo, liberar carga acumulada y elegir el acompañamiento adecuado para ti.`

CTA principal : `Reservar una sesión`

CTA secondaire : `Escribir por WhatsApp`

Micro-note :
`Cupos limitados por semana. Atención privada con cita previa en Ciudad de México.`

## Section “No es un masaje clásico”

Titre :
`No es un masaje clásico. Es un reset corporal preciso.`

Texte :
`Un masaje tradicional suele buscar relajación general. Body Reset empieza con una lectura del cuerpo: cómo respiras, cómo te mueves, dónde cargas tensión y qué zona necesita prioridad.`

`A partir de esa lectura, el trabajo manual se adapta a tu cuerpo ese día. La intención no es forzar, sino crear espacio, soltar carga y ayudarte a recuperar una sensación de movilidad, ligereza y presencia corporal.`

Points :
- `Lectura corporal antes de empezar.`
- `Trabajo manual profundo, pero calibrado.`
- `Enfoque en tensión, movilidad y descanso del sistema nervioso.`
- `Experiencia francesa aplicada de forma personalizada.`
- `Recomendaciones claras después de la sesión.`

## Section offres

Ajouter une vraie section comparative, pas seulement un paragraphe.

### Titre
`Elige el formato que mejor corresponde a tu cuerpo.`

### Offre 1
Nom : `Body Reset Fix`
Sous-titre : `Una sesión privada puntual para trabajar una prioridad clara.`
Texte : `Ideal si sientes una zona cargada, un cuerpo bloqueado o necesitas una primera sesión concreta para recuperar movilidad y ligereza.`
Inclus :
- `Sesión privada personalizada.`
- `Lectura rápida de tu tensión principal.`
- `Trabajo manual preciso en la zona prioritaria.`
- `Recomendaciones simples después de la sesión.`
CTA : `Reservar Body Reset Fix`

### Offre 2
Nom : `French Body Reset Full`
Sous-titre : `Un protocolo completo en 3 sesiones para un trabajo más profundo y progresivo.`
Texte : `Ideal si quieres ir más allá de una sola zona y acompañar tu cuerpo con un proceso completo: lectura corporal, trabajo manual, integración y orientación personalizada.`
Inclus :
- `3 sesiones privadas.`
- `Lectura corporal progresiva.`
- `Trabajo manual preciso y adaptado.`
- `Integración entre sesiones.`
- `Recomendaciones post-reset.`
- `Orientación personalizada para elegir la continuación adecuada.`
CTA : `Consultar el protocolo Full`

## Section “Para quién es”

Titre : `Para ti si tu cuerpo te pide una pausa real.`

Texte : `Body Reset puede ser una buena opción si sientes el cuerpo cargado, rígido o menos libre de lo habitual.`

Chips :
- `Espalda cargada`
- `Cuello rígido`
- `Hombros tensos`
- `Caderas bloqueadas`
- `Piernas pesadas`
- `Fatiga acumulada`
- `Estrés`
- `Cuerpo trabado`
- `Después de viaje`
- `Mucha computadora`

## Déroulé

Titre : `Simple, privado y personalizado.`

Étapes :
1. `Reserva o escribe por WhatsApp.`
2. `Completa un formulario corto para entender tu prioridad.`
3. `Recibes una sesión privada adaptada a tu cuerpo.`
4. `Te vas con recomendaciones claras para integrar el reset.`

## Formulaire adapté

Le formulaire doit qualifier :

1. Nom
   - label : `Nombre`
   - placeholder : `Tu nombre`

2. WhatsApp
   - label : `WhatsApp`
   - placeholder : `+52...`

3. Priorité corporelle
   - label : `¿Qué quieres trabajar primero?`
   - options :
     - `Espalda`
     - `Cuello / nuca`
     - `Hombros`
     - `Caderas`
     - `Piernas`
     - `Estrés / cuerpo cargado`
     - `Fatiga`
     - `No estoy seguro/a`

4. Offre souhaitée
   - label : `¿Qué formato te interesa más?`
   - options :
     - `Body Reset Fix — 1 sesión puntual`
     - `French Body Reset Full — protocolo de 3 sesiones`
     - `No sé todavía, quiero orientación`

5. Urgence
   - label : `¿Qué tan pronto quieres venir?`
   - options :
     - `Esta semana`
     - `La próxima semana`
     - `Estoy comparando opciones`
     - `Quiero hacer una pregunta primero`

6. Message optionnel
   - label : `Mensaje opcional`
   - placeholder : `Cuéntame en pocas palabras qué sientes o qué estás buscando.`

CTA formulaire : `Enviar solicitud`

Message succès :
`Gracias. Recibimos tu solicitud. Te responderemos por WhatsApp para orientarte hacia el formato más adecuado.`

## Boutons WhatsApp Mexico

Ajouter ou adapter les CTA WhatsApp pour utiliser le numéro Mexico configuré via :

`NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER`

Le code existant doit continuer à nettoyer le numéro en digits only et générer `https://wa.me/...`.

Messages préremplis :

### Général
`Hola Grégory, estoy en CDMX y quiero reservar una sesión de Body Reset. Me interesa saber si me conviene Body Reset Fix o French Body Reset Full.`

### Fix
`Hola Grégory, estoy en CDMX y quiero reservar Body Reset Fix para una zona prioritaria.`

### Full
`Hola Grégory, estoy en CDMX y quiero información sobre French Body Reset Full, el protocolo de 3 sesiones.`

CTA labels :
- `Escribir por WhatsApp`
- `Reservar Body Reset Fix`
- `Consultar el protocolo Full`

## FAQ courte

1. `¿Es un masaje?`
Réponse : `No es un masaje clásico de relajación. Es una sesión manual personalizada que empieza con una lectura del cuerpo y se adapta a lo que necesitas ese día.`

2. `¿Es una consulta médica?`
Réponse : `No. Body Reset es un acompañamiento manual de bienestar corporal. No reemplaza un diagnóstico, tratamiento médico ni seguimiento con un profesional de salud.`

3. `¿Cuál es la diferencia entre Fix y Full?`
Réponse : `Body Reset Fix es una sesión puntual para una prioridad clara. French Body Reset Full es un protocolo de 3 sesiones para un trabajo más profundo, progresivo y acompañado.`

4. `¿Cuánto dura una sesión?`
Réponse : `La duración exacta puede depender del formato reservado. La sesión se realiza con cita previa y atención privada.`

5. `¿Cómo sé qué opción elegir?`
Réponse : `Si tienes una prioridad clara, empieza con Body Reset Fix. Si quieres un acompañamiento más completo y progresivo, elige French Body Reset Full. También puedes escribir por WhatsApp y te orientamos.`

## CTA final

Titre : `Tu cuerpo no necesita más presión. Necesita ser escuchado con precisión.`

Texte : `Reserva tu sesión privada en CDMX o escribe por WhatsApp para elegir el formato más adecuado.`

CTA principal : `Reservar una sesión`
CTA secondaire : `Hablar por WhatsApp`

## Contraintes de sécurité et conformité

- Ne pas promettre de guérison.
- Ne pas présenter Body Reset comme acte médical.
- Ne pas utiliser de termes médicaux agressifs.
- Ne pas créer de claims non prouvés.
- Garder un ton premium, sobre, humain, rassurant.

## Validation demandée

Lancer :

```bash
pnpm exec prisma validate
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Vérifier ensuite :

- la landing ES-MX affiche bien les deux offres ;
- le formulaire envoie bien les nouveaux champs ou les encode dans `context`, `needType`, `intent`, `branchData` selon la structure existante ;
- les CTA WhatsApp ouvrent bien `wa.me` avec le numéro Mexico ;
- aucun secret n’est exposé côté client ;
- les anciennes routes ne cassent pas ;
- le sitemap/canonical/hreflang restent cohérents.
