import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * seedCardDesigns — RE/Mortgage Clone
 *
 * Creates platform CardDesign records pointing to the same public image URLs
 * as the main NurturInk app. No images are re-uploaded — the URLs are public
 * and accessible from any app.
 *
 * Idempotent — skips designs whose name already exists.
 * Run from Base44 Dashboard > Functions > seedCardDesigns > Test with body: {}
 */

const DESIGNS = [
  {
    name: 'Welcome - Papercut',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/a1aea6972_WelcomePapercutCanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/162918ca2_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/f2a701825_WelcomePapercutCanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/c67783b07_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/485475cd8_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/0b875e067_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/e5ee16d96_variant_200.jpg' },
  },
  {
    name: 'Welcome - Mod',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/51cc3390e_WelcomeCanva2_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/482a9136a_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/97be09d89_WelcomeCanva2_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/b10b30a3b_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/dfdbce4fc_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/7fee64fe7_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/90e92252d_variant_200.jpg' },
  },
  {
    name: 'Welcome - Colorful',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/cf51894bf_WelcomeBrightColorsCanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/59c88c11a_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/558a75068_WelcomeBrightColorsCanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/a2256d9be_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/a5d3491fc_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/2ce804eb6_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/75c540863_variant_200.jpg' },
  },
  {
    name: 'Thinking of You - Blue Classic',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/f6303a103_toyblue_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/4640c256f_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/6d5c7b03d_toyblue_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/7ba94468c_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/5257b48cf_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/8b72177d6_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/aa42cfd31_variant_200.jpg' },
  },
  {
    name: 'Thinking of You - Green Sunrise',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/4542fe049_ThinkingofYouCanva2_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/9058ef767_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/df330b8ee_ThinkingofYouCanva2_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/0d8a41846_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/5b277e63b_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/3f7dced77_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/e09caed8a_variant_200.jpg' },
  },
  {
    name: 'Thinking of You - Purple Floral',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/bf5d4b479_ThinkingPurplecanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/78f43d821_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/7a4d066da_ThinkingPurplecanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/da4129044_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/7ad76f257_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/4a15756ff_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/a0095d511_variant_200.jpg' },
  },
  {
    name: 'Thinking of You - Pink Really',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/77628a80f_Thinkingpink_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/b6a33e39d_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/1ae501c98_Thinkingpink_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/47fb347d6_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/08b402d86_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/78672704f_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/04525f457_variant_200.jpg' },
  },
  {
    name: 'Thinking of You - Pink Floral',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/35deda9ec_ThinkingPeachcanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/733e3eee4_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/88cd12b3a_ThinkingPeachcanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/0ed31d686_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/3c4195b07_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/d283de6b2_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/ee235db00_variant_200.jpg' },
  },
  {
    name: 'Thinking of You - Green Floral',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/5fd5c4532_Thinkinggreencanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/007c054b2_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/f72a47838_Thinkinggreencanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/99389a17c_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/4cc9fcdea_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/ef5c95c10_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/f9fc6de41_variant_200.jpg' },
  },
  {
    name: 'Thank You - Pen',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/7c7594741_ThankYouPenCanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/b7afc80a6_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/d0cd72501_ThankYouPenCanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/f3d2b735f_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/5d096be7d_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/eee41c688_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/c3c27ef6a_variant_200.jpg' },
  },
  {
    name: 'Thank You - Green Classic',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/73e13ef61_thankyougreen_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/abdd4eafd_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/b69d39147_thankyougreen_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/a5fcdcec1_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/cfdc5a6af_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/88aa2e8d2_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/4f5525e8d_variant_200.jpg' },
  },
  {
    name: 'Open Me - Bow',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/dfa16f246_JustBecause3canva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/52e289a3b_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/a221dbaac_JustBecause3canva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/72bc516f6_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/2f323afad_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/8abbf55dc_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/c9ede4452_variant_200.jpg' },
  },
  {
    name: 'Anniversary Deco',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/580567a21_HappyAnniversaryDecoCanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/74eb9bfba_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/15a8fc38a_HappyAnniversaryDecoCanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/d561e8c3f_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/1f7a2ecab_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/47a3ac6e5_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/86b8a01dc_variant_200.jpg' },
  },
  {
    name: 'Dark Birthday',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/0d88341ee_Birthday4canva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/7ef6d127d_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/675181bee_Birthday4canva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/0641720fb_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/adb6c18b3_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/c375d17eb_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/af61a9fa5_variant_200.jpg' },
  },
  {
    name: 'Happy Birthday Balloons',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/5fc131c81_birthdaycanva_front400w.jpg',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/aaf552216_BackBlank.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/6d45ebc4a_birthdaycanva_outside600w.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/11497c671_InsideBlank.png',
    outsideImageVariants: { w600: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/8d78e9371_variant_600.jpg', w400: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/d1fa9b386_variant_400.jpg', w200: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/d7d388f82_variant_200.jpg' },
  },
  {
    name: 'Open Me Flowers',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/df5609343_openmeflowerstiny.png',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/406f9af86_ThankYouBack1.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/e2f8b2e6e_uncategorized__open_me_flowers__600x.jpg',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/64444cc4a_smThankyouInside2.png',
    outsideImageVariants: null,
  },
  {
    name: 'Thank You for Trusting Us',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/ea8ffd11d_ThankYouFront1.png',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/9b3c21ee1_ThankYouBack2.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/6b303a8e6_smThankYouOutside1.png',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/947e3a25d_smThankyouInside2.png',
    outsideImageVariants: null,
  },
  {
    name: 'Thank You - Plain White',
    frontImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/e9c46d4be_ThankYouFront.png',
    backImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/32bfeda4c_ThankYouBack1.png',
    outsideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/6e7895769_smThankYouOutside2.png',
    insideImageUrl: 'https://base44.app/api/apps/696020df49a02437cf7a3031/files/public/696020df49a02437cf7a3031/324c7f1bf_smThankyouInside2.png',
    outsideImageVariants: null,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.appRole !== 'super_admin') {
      return Response.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Get existing designs to make this idempotent
    const existing = await base44.asServiceRole.entities.CardDesign.filter({ type: 'platform' });
    const existingNames = new Set(existing.map((d) => d.name));

    const toCreate = DESIGNS.filter((d) => !existingNames.has(d.name));

    if (toCreate.length === 0) {
      return Response.json({
        success: true,
        message: 'All card designs already exist — nothing to create.',
        total: existing.length,
      });
    }

    const records = toCreate.map((d) => ({
      name: d.name,
      type: 'platform',
      orgId: null,
      isDefault: false,
      isActive: true,
      frontImageUrl: d.frontImageUrl,
      backImageUrl: d.backImageUrl,
      outsideImageUrl: d.outsideImageUrl,
      insideImageUrl: d.insideImageUrl,
      outsideImageVariants: d.outsideImageVariants || null,
      cardDesignCategoryIds: [],
    }));

    await base44.asServiceRole.entities.CardDesign.bulkCreate(records);

    return Response.json({
      success: true,
      message: `Created ${records.length} card designs.`,
      created: records.map((r) => r.name),
    });

  } catch (error) {
    console.error('[seedCardDesigns] error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});