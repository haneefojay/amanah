import type {
  CampaignDetail,
  CampaignItem,
  CampaignListResponse,
  CampaignStatus,
  CampaignSummary,
  CurrentUser,
  OrganisationProfile,
  OrganisationSummary,
  UserRole,
} from "@/lib/api/schemas";

export const organisationIds = {
  mosque: "8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a41",
  orphanage: "8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a42",
  society: "8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a43",
} as const;

const id = (n: number) => `7b3e2a8c-1f4d-4c1e-9a52-3d6f0b8e1a${String(n).padStart(2, "0")}`;

/** Demo-flavoured fixtures that match the spec §10 demo script. Amounts are kobo. */
export const campaigns: CampaignSummary[] = [
  {
    id: id(1),
    slug: "ramadan-food-drive-offa",
    title: "Ramadan food drive",
    organisationId: organisationIds.mosque,
    organisationName: "Central Mosque, Offa",
    city: "Offa",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/food-drive.jpg",
    status: "LIVE",
    targetAmount: 50_000_000,
    raisedAmount: 30_000_000,
    availableAmount: 20_000_000,
  },
  {
    id: id(2),
    slug: "school-supplies-40-orphans",
    title: "School supplies for 40 orphans",
    organisationId: organisationIds.orphanage,
    organisationName: "Darul Aytam Orphan Home",
    city: "Ilorin",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/school-supplies.jpg",
    status: "LIVE",
    targetAmount: 120_000_000,
    raisedAmount: 112_000_000,
    availableAmount: 8_000_000,
  },
  {
    id: id(3),
    slug: "borehole-islamiyya-school",
    title: "Borehole for the Islamiyya school",
    organisationId: organisationIds.society,
    organisationName: "An-Nur Islamic Society",
    city: "Ogbomoso",
    state: "Oyo",
    coverImageUrl: "/images/campaigns/borehole.jpg",
    status: "FUNDED",
    targetAmount: 85_000_000,
    raisedAmount: 85_000_000,
    availableAmount: 0,
  },
  {
    id: id(4),
    slug: "eid-clothes-30-children",
    title: "Eid clothes for 30 children",
    organisationId: organisationIds.mosque,
    organisationName: "Central Mosque, Offa",
    city: "Offa",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/eid-clothes.jpg",
    status: "LIVE",
    targetAmount: 40_000_000,
    raisedAmount: 38_000_000,
    availableAmount: 0,
  },
  {
    id: id(5),
    slug: "quran-learning-materials",
    title: "Qur’an learning materials for the evening class",
    organisationId: organisationIds.orphanage,
    organisationName: "Darul Aytam Orphan Home",
    city: "Ilorin",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/quran-class.jpg",
    status: "LIVE",
    targetAmount: 30_000_000,
    raisedAmount: 6_000_000,
    availableAmount: 24_000_000,
  },
  {
    id: id(6),
    slug: "mosque-roof-repair-oke-ode",
    title: "Repairing the storm-damaged roof of the Oke-Ode community mosque and its Qur’an school",
    organisationId: organisationIds.society,
    organisationName: "An-Nur Islamic Society",
    city: "Ogbomoso",
    state: "Oyo",
    coverImageUrl: "/images/campaigns/roof-repair.jpg",
    status: "CLOSED",
    targetAmount: 90_000_000,
    raisedAmount: 61_000_000,
    availableAmount: 0,
  },
  {
    id: id(7),
    slug: "clinic-medicines-ilorin",
    title: "Medicines for the community clinic",
    organisationId: organisationIds.orphanage,
    organisationName: "Darul Aytam Orphan Home",
    city: "Ilorin",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/clinic-medicines.jpg",
    status: "COMPLETED",
    targetAmount: 25_000_000,
    raisedAmount: 25_000_000,
    availableAmount: 0,
  },
  {
    id: id(8),
    slug: "winter-blankets-offa",
    title: "Blankets for the harmattan season",
    organisationId: organisationIds.mosque,
    organisationName: "Central Mosque, Offa",
    city: "Offa",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/blankets.jpg",
    status: "COMPLETED",
    targetAmount: 18_000_000,
    raisedAmount: 18_000_000,
    availableAmount: 0,
  },
  {
    id: id(10),
    slug: "prayer-mats-womens-section",
    title: "Prayer mats for the women’s section",
    organisationId: organisationIds.mosque,
    organisationName: "Central Mosque, Offa",
    city: "Offa",
    state: "Kwara",
    coverImageUrl: "/images/campaigns/prayer-mats.jpg",
    status: "FUNDED",
    targetAmount: 27_000_000,
    raisedAmount: 27_000_000,
    availableAmount: 0,
  },
  // Not public: must never appear in the public list.
  {
    id: id(9),
    slug: "draft-campaign",
    title: "A draft nobody should see",
    organisationId: organisationIds.mosque,
    organisationName: "Central Mosque, Offa",
    city: "Offa",
    state: "Kwara",
    coverImageUrl: null,
    status: "DRAFT",
    targetAmount: 10_000_000,
    raisedAmount: 0,
    availableAmount: 10_000_000,
  },
];

export const PUBLIC_STATUSES: CampaignStatus[] = ["LIVE", "FUNDED", "CLOSED", "COMPLETED"];
const statusRank: Record<string, number> = { LIVE: 0, FUNDED: 1, CLOSED: 2, COMPLETED: 3 };

export const publicCampaigns = campaigns
  .filter((c) => PUBLIC_STATUSES.includes(c.status))
  .sort((a, b) => statusRank[a.status]! - statusRank[b.status]!);

export const PAGE_SIZE = 6;

/** What GET /api/campaigns returns for a list of campaigns (tests build custom lists with it). */
export function campaignListBody(
  data: CampaignSummary[],
  over: Partial<CampaignListResponse["meta"]> = {},
): CampaignListResponse {
  return {
    data,
    meta: {
      page: 1,
      pageSize: PAGE_SIZE,
      total: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / PAGE_SIZE)),
      ...over,
    },
    filters: {
      cities: [...new Set(publicCampaigns.map((c) => c.city))].sort(),
      organisations: [
        ...new Map(publicCampaigns.map((c) => [c.organisationId, c.organisationName])),
      ]
        .map(([orgId, name]) => ({ id: orgId, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
  };
}

const ended: CampaignStatus[] = ["CLOSED", "COMPLETED"];

type OrganisationSeed = Pick<
  OrganisationSummary,
  "id" | "name" | "city" | "state" | "verifiedAt"
> & {
  address: string;
  coverImageUrl: string;
};

const organisationSeeds: OrganisationSeed[] = [
  {
    id: organisationIds.mosque,
    name: "Central Mosque, Offa",
    address: "12 Station Road, Offa, Kwara State",
    coverImageUrl: "/images/organisations/central-mosque-offa.jpg",
    city: "Offa",
    state: "Kwara",
    verifiedAt: "2026-09-04T10:00:00.000Z",
  },
  {
    id: organisationIds.orphanage,
    name: "Darul Aytam Orphan Home",
    address: "5 Unity Close, Ilorin, Kwara State",
    coverImageUrl: "/images/organisations/darul-aytam-ilorin.jpg",
    city: "Ilorin",
    state: "Kwara",
    verifiedAt: "2026-09-12T10:00:00.000Z",
  },
  {
    id: organisationIds.society,
    name: "An-Nur Islamic Society",
    address: "21 Oke-Ode Road, Ogbomoso, Oyo State",
    coverImageUrl: "/images/organisations/an-nur-ogbomoso.jpg",
    city: "Ogbomoso",
    state: "Oyo",
    verifiedAt: "2026-09-20T10:00:00.000Z",
  },
];

/** Verified organisations with counts computed from the public campaigns above. */
export const organisations: OrganisationSummary[] = organisationSeeds.map(
  ({ address, coverImageUrl, ...org }) => {
    void address;
    void coverImageUrl;
    const own = publicCampaigns.filter((c) => c.organisationId === org.id);
    return {
      ...org,
      campaignCount: own.length,
      endedCount: own.filter((c) => ended.includes(c.status)).length,
      completedCount: own.filter((c) => c.status === "COMPLETED").length,
    };
  },
);

/** Mock witnesses, named publicly as the design requires (spec §3: independent of the organisation). */
const witnesses = {
  offa: "Ustadh Ibrahim Yusuf",
  ilorin: "Alhaja Rukayat Adebayo",
  ogbomoso: "Mallam Sulaiman Oyewole",
} as const;

type ConfirmationSeed = [
  status: "CONFIRMED" | "DISPUTED",
  witness: string,
  at: string,
  comment?: string,
];
type ItemSeed = [
  name: string,
  quantity: number,
  unitNaira: number,
  status: CampaignItem["status"],
  confirmation?: ConfirmationSeed,
];

const confirmed = (witness: string, at: string): ConfirmationSeed => ["CONFIRMED", witness, at];

type ExpenseSeed = [
  description: string,
  vendor: string,
  naira: number,
  spentAt: string,
  /** Index into the campaign's items, or null for a general cost. */
  item: number | null,
  receipt: boolean,
];

type EvidenceSeed = [
  photo: string,
  /** Index into the campaign's items or expenses; at most one is set. */
  link: { item: number } | { expense: number } | null,
  location: [latitude: number, longitude: number] | null,
  capturedAtClient: string | null,
  uploadedAtServer: string,
];

const story: Record<
  string,
  {
    purpose: string;
    description: string[];
    items: ItemSeed[];
    expenses?: ExpenseSeed[];
    evidence?: EvidenceSeed[];
    /** [body, postedAt, photos], newest first. */
    updates?: [body: string, postedAt: string, photos: string[]][];
  }
> = {
  "ramadan-food-drive-offa": {
    purpose: "Food packs for 120 families in Offa for the last ten nights of Ramadan.",
    description: [
      "Every year the mosque’s welfare committee prepares food packs for families who struggle during Ramadan. This year 120 families from the mosque’s community register are on the list, chosen with the ward heads.",
      "Each pack holds rice, cooking oil, dates and sugar for a family of six. Packs are handed out after Jumu’ah on the last two Fridays of the month, and a witness from the community confirms each delivery.",
    ],
    items: [
      [
        "Rice, 50 kg bags",
        5,
        56_000,
        "DELIVERED",
        confirmed(witnesses.offa, "2026-10-14T15:30:00Z"),
      ],
      ["Cooking oil, 25 L kegs", 4, 30_000, "NEEDED"],
      ["Dates and sugar packs", 40, 2_500, "NEEDED"],
    ],
    expenses: [
      [
        "Rice, 5 bags of 50 kg",
        "Musa & Sons Grains, Offa Main Market",
        275_000,
        "2026-10-12T10:30:00Z",
        0,
        true,
      ],
      [
        "Transport of the rice to the mosque",
        "Market loaders, Offa",
        5_000,
        "2026-10-12T12:00:00Z",
        null,
        false,
      ],
    ],
    evidence: [
      [
        "food-drive.jpg",
        { item: 0 },
        [8.14921, 4.72036],
        "2026-10-14T15:05:00Z",
        "2026-10-14T15:42:00Z",
      ],
    ],
    updates: [
      [
        "The rice has arrived at the mosque store. Packing starts after Asr on Thursday with the welfare committee, and Ustadh Ibrahim Yusuf has confirmed the delivery.",
        "2026-10-14T16:00:00Z",
        ["food-drive.jpg"],
      ],
      [
        "Thank you to everyone who has given. We are buying the rice first, at Offa Main Market on Monday. The oil and the date packs follow as the rest is raised.",
        "2026-10-11T09:00:00Z",
        [],
      ],
    ],
  },
  "school-supplies-40-orphans": {
    purpose: "Uniforms, books and bags so 40 children can start the new term ready to learn.",
    description: [
      "The home looks after 40 children of school age. Many start each term without a uniform or enough exercise books.",
      "Supplies are bought in one order from a local supplier and handed out at the home, with a witness present.",
    ],
    items: [
      [
        "School uniforms",
        40,
        12_000,
        "DELIVERED",
        confirmed(witnesses.ilorin, "2026-10-13T11:00:00Z"),
      ],
      [
        "Exercise books",
        400,
        800,
        "DELIVERED",
        confirmed(witnesses.ilorin, "2026-10-13T11:05:00Z"),
      ],
      [
        "School bags",
        40,
        10_000,
        "DISPUTED",
        [
          "DISPUTED",
          witnesses.ilorin,
          "2026-10-15T10:20:00Z",
          "Only 24 of the 30 bags bought so far reached the home. I have asked the organisation to show where the other 6 are.",
        ],
      ],
    ],
    expenses: [
      [
        "School bags, first 30",
        "Oja-Oba bag sellers, Ilorin",
        300_000,
        "2026-10-11T09:00:00Z",
        2,
        true,
      ],
      [
        "School uniforms for 40 children",
        "Ilorin Uniform Makers",
        480_000,
        "2026-10-08T10:00:00Z",
        0,
        true,
      ],
      ["Exercise books, 400", "Kwara Stationers, Ilorin", 320_000, "2026-10-08T09:30:00Z", 1, true],
    ],
    evidence: [
      [
        "school-supplies.jpg",
        { item: 0 },
        [8.49664, 4.54214],
        "2026-10-13T10:49:30Z",
        "2026-10-13T10:49:50Z",
      ],
    ],
    updates: [
      [
        "Our witness found 6 of the first 30 school bags missing on delivery. We are checking with the seller and will post what we find here. No more bags will be bought until this is settled.",
        "2026-10-15T14:00:00Z",
        [],
      ],
      [
        "Uniforms and exercise books were handed out at the home on Tuesday.",
        "2026-10-13T12:00:00Z",
        ["school-supplies.jpg"],
      ],
    ],
  },
  "borehole-islamiyya-school": {
    purpose: "A borehole so the Islamiyya school and its neighbours have clean water on site.",
    description: [
      "Pupils and teachers walk to a shared well that runs low in the dry season. A borehole on the school grounds would serve about 300 pupils and the families nearby.",
    ],
    items: [
      [
        "Drilling and casing",
        1,
        450_000,
        "DELIVERED",
        confirmed(witnesses.ogbomoso, "2026-10-12T12:00:00Z"),
      ],
      ["Submersible pump", 1, 250_000, "PURCHASED"],
      ["Tank and stand", 1, 150_000, "PURCHASED"],
    ],
    expenses: [
      ["Submersible pump", "Ogbomoso Pumps and Tanks", 250_000, "2026-10-12T08:00:00Z", 1, true],
      [
        "Drilling and casing",
        "Oyewole Drilling Services",
        450_000,
        "2026-10-06T08:00:00Z",
        0,
        true,
      ],
    ],
    evidence: [
      [
        "borehole.jpg",
        { item: 0 },
        [8.13302, 4.24086],
        "2026-10-12T11:40:00Z",
        "2026-10-12T11:41:10Z",
      ],
    ],
    updates: [
      [
        "Drilling is finished and the casing is in. The pump goes in next week.",
        "2026-10-12T13:00:00Z",
        ["borehole.jpg"],
      ],
    ],
  },
  "eid-clothes-30-children": {
    purpose: "New outfits and shoes for 30 children from families the mosque supports.",
    description: [
      "The mosque’s welfare committee has a list of 30 children who would otherwise go without new clothes for Eid.",
    ],
    items: [
      ["Eid outfits", 30, 10_000, "PURCHASED"],
      ["Shoes", 20, 5_000, "NEEDED"],
    ],
    expenses: [
      [
        "Eid outfits for 30 children",
        "Offa Tailors' Cooperative",
        300_000,
        "2026-10-13T11:00:00Z",
        0,
        true,
      ],
    ],
    evidence: [
      ["eid-clothes.jpg", { expense: 0 }, null, "2026-10-13T12:00:00Z", "2026-10-13T12:30:00Z"],
    ],
  },
  "quran-learning-materials": {
    purpose: "Copies of the Qur’an and writing boards for the evening class.",
    description: [
      "The evening class has grown to 30 children and shares a handful of copies. Each child should have their own.",
    ],
    items: [
      ["Copies of the Qur’an", 30, 6_000, "NEEDED"],
      ["Writing boards", 12, 10_000, "NEEDED"],
    ],
  },
  "mosque-roof-repair-oke-ode": {
    purpose:
      "Repairing the storm-damaged roof so prayers and classes can continue in the rainy season.",
    description: [
      "A storm tore sheets off the roof of the community mosque and its Qur’an school. The campaign closed below its target; the funds raised are used for the repairs listed below.",
    ],
    items: [
      ["Roofing sheets", 60, 9_000, "DELIVERED"],
      ["Timber and labour", 1, 360_000, "NEEDED"],
    ],
    expenses: [
      ["Roofing sheets, 60", "Ogbomoso Roofing Supplies", 540_000, "2026-10-07T10:00:00Z", 0, true],
    ],
    evidence: [["roof-repair.jpg", { item: 0 }, [8.1247, 4.254], null, "2026-10-08T09:00:00Z"]],
  },
  "prayer-mats-womens-section": {
    purpose: "New prayer mats for the women’s section, which has outgrown its old ones.",
    description: [
      "The women’s section fills up every Jumu’ah and the old mats are worn through. The new mats are bought from a weaver in Offa.",
    ],
    items: [
      ["Prayer mats", 45, 5_000, "DELIVERED", confirmed(witnesses.offa, "2026-10-09T14:00:00Z")],
      ["Underlay rolls", 3, 15_000, "DELIVERED", confirmed(witnesses.offa, "2026-10-09T14:05:00Z")],
    ],
    expenses: [
      ["Underlay rolls, 3", "Offa Main Market", 45_000, "2026-10-08T12:00:00Z", 1, true],
      ["Prayer mats, 45", "Mama Kudi's weaving, Offa", 225_000, "2026-10-08T11:00:00Z", 0, true],
    ],
    evidence: [["prayer-mats.jpg", { item: 0 }, [8.14735, 4.71912], null, "2026-10-09T13:30:00Z"]],
  },
  "clinic-medicines-ilorin": {
    purpose: "Basic medicines for the community clinic that serves the home’s neighbourhood.",
    description: [
      "The clinic ran short of basic medicines. Everything below was bought, delivered and confirmed by a witness.",
    ],
    items: [
      [
        "Antimalarial courses",
        100,
        1_500,
        "DELIVERED",
        confirmed(witnesses.ilorin, "2026-09-28T09:40:00Z"),
      ],
      [
        "ORS and zinc packs",
        100,
        1_000,
        "DELIVERED",
        confirmed(witnesses.ilorin, "2026-09-28T09:45:00Z"),
      ],
    ],
    expenses: [
      [
        "ORS and zinc packs, 100",
        "Unity Pharmacy, Ilorin",
        100_000,
        "2026-09-25T10:15:00Z",
        1,
        true,
      ],
      [
        "Antimalarial courses, 100",
        "Unity Pharmacy, Ilorin",
        150_000,
        "2026-09-25T10:00:00Z",
        0,
        true,
      ],
    ],
    evidence: [
      [
        "clinic-medicines.jpg",
        { item: 0 },
        [8.48124, 4.55301],
        "2026-09-27T16:10:00Z",
        "2026-09-28T08:05:00Z",
      ],
    ],
    updates: [
      [
        "All the medicines are at the clinic and the witness has confirmed them. Thank you for making this possible.",
        "2026-09-28T10:00:00Z",
        ["clinic-medicines.jpg"],
      ],
    ],
  },
  "winter-blankets-offa": {
    purpose: "Blankets for 60 families through the harmattan season.",
    description: [
      "Nights get cold in Offa during the harmattan. Blankets were handed out after Jumu’ah and confirmed by a witness.",
    ],
    items: [
      ["Blankets", 60, 3_000, "DELIVERED", confirmed(witnesses.offa, "2026-09-20T13:15:00Z")],
    ],
    expenses: [["Blankets, 60", "Offa Main Market", 180_000, "2026-09-18T10:00:00Z", 0, true]],
    evidence: [["blankets.jpg", null, [8.14921, 4.72036], null, "2026-09-20T12:50:00Z"]],
    updates: [
      [
        "The blankets were handed out after Jumu’ah to all 60 families.",
        "2026-09-20T14:00:00Z",
        ["blankets.jpg"],
      ],
    ],
  },
};

/** Full campaign pages by slug, for the public campaign endpoint. Items total each target. */
export const campaignDetails: Record<string, CampaignDetail> = Object.fromEntries(
  publicCampaigns.map((c, index) => {
    const entry = story[c.slug]!;
    const detail: CampaignDetail = {
      ...c,
      purpose: entry.purpose,
      description: entry.description,
      publishedAt: new Date(Date.UTC(2026, 9, 10 - index, 9)).toISOString(),
      endsAt: null,
      items: entry.items.map(([name, quantity, unitNaira, status, confirmation], n) => ({
        id: `9c4d1e7a-2b3f-4a50-8d61-0e1f2a3b4c${String(index * 10 + n).padStart(2, "0")}`,
        name,
        quantity,
        unitCost: unitNaira * 100,
        totalCost: quantity * unitNaira * 100,
        status,
        confirmation: confirmation
          ? {
              status: confirmation[0],
              witnessName: confirmation[1],
              confirmedAt: confirmation[2],
              comment: confirmation[3] ?? null,
            }
          : null,
      })),
      organisation: organisations.find((o) => o.id === c.organisationId)!,
      expenses: [],
      evidence: [],
      updates: (entry.updates ?? []).map(([body, postedAt, photos], n) => ({
        id: `3d2c1b0a-9f8e-4b7d-8c6b-3d2c1b0a9f${String(index * 10 + n).padStart(2, "0")}`,
        body,
        images: photos.map((photo) => `/images/campaigns/${photo}`),
        postedAt,
      })),
    };
    detail.expenses = (entry.expenses ?? []).map(
      ([description, vendorName, naira, spentAt, itemIndex, hasReceipt], n) => {
        const ref = String(index * 10 + n).padStart(2, "0");
        return {
          id: `6a5f4e3d-2c1b-4a09-8e7d-6c5b4a3e2d${ref}`,
          description,
          vendorName,
          amount: naira * 100,
          spentAt,
          itemId: itemIndex === null ? null : detail.items[itemIndex]!.id,
          receipt: hasReceipt
            ? {
                id: `5b4a3c2d-1e0f-4a98-9d7c-5b4a3c2d1e${ref}`,
                imageUrl: `/images/receipts/${c.slug}-${n + 1}.svg`,
                thumbnailUrl: `/images/receipts/${c.slug}-${n + 1}.svg`,
                uploadedAtServer: new Date(Date.parse(spentAt) + 50 * 60_000).toISOString(),
              }
            : null,
        };
      },
    );
    detail.evidence = (entry.evidence ?? []).map(
      ([photo, link, location, capturedAtClient, uploadedAtServer], n) => ({
        id: `4c3b2a19-0f8e-4d7c-8b6a-4c3b2a190f${String(index * 10 + n).padStart(2, "0")}`,
        imageUrl: `/images/campaigns/${photo}`,
        thumbnailUrl: `/images/campaigns/${photo}`,
        itemId: link && "item" in link ? detail.items[link.item]!.id : null,
        expenseId: link && "expense" in link ? detail.expenses[link.expense]!.id : null,
        latitude: location?.[0] ?? null,
        longitude: location?.[1] ?? null,
        capturedAtClient,
        uploadedAtServer,
      }),
    );
    return [c.slug, detail];
  }),
);

/** Public profiles by organisation id. Any other id is not a verified organisation (404). */
export const organisationProfiles: Record<string, OrganisationProfile> = Object.fromEntries(
  organisationSeeds.map((seed) => {
    const summary = organisations.find((o) => o.id === seed.id)!;
    const own = publicCampaigns.filter((c) => c.organisationId === seed.id);
    const profile: OrganisationProfile = {
      ...summary,
      address: seed.address,
      coverImageUrl: seed.coverImageUrl,
      raisedAmount: own.reduce((sum, c) => sum + c.raisedAmount, 0),
      campaigns: own,
    };
    return [seed.id, profile];
  }),
);

/** One demo user per staff role (spec §3). The mock API serves the role in MOCK_ROLE. */
export const usersByRole: Record<UserRole, CurrentUser> = {
  ORG_ADMIN: {
    id: "5d1c6b0e-6a40-4f8e-9e3a-2b7f1c9d0a11",
    name: "Aisha Bello",
    email: "aisha@example.org",
    role: "ORG_ADMIN",
    organisations: [{ id: "8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a41", name: "Central Mosque, Offa" }],
  },
  WITNESS: {
    id: "5d1c6b0e-6a40-4f8e-9e3a-2b7f1c9d0a12",
    name: "Ustadh Ibrahim Yusuf",
    email: "ibrahim@example.org",
    role: "WITNESS",
    organisations: [],
  },
  PLATFORM_ADMIN: {
    id: "5d1c6b0e-6a40-4f8e-9e3a-2b7f1c9d0a13",
    name: "Amanah Admin",
    email: "admin@example.org",
    role: "PLATFORM_ADMIN",
    organisations: [],
  },
};
