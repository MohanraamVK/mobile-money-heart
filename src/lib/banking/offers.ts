import type { UserProfile } from "./types";

export interface Offer {
  id: string;
  title: string;
  partner: string;
  category: "travel" | "dining" | "shopping" | "tech" | "wellness" | "finance";
  discount: string;
  description: string;
  expires: string;
  reason: string; // why we picked this for them
  isNew?: boolean;
}

const ALL_OFFERS: Offer[] = [
  {
    id: "off-1",
    title: "5% cashback on Spotify, Netflix & Disney+",
    partner: "Streaming",
    category: "tech",
    discount: "5% back",
    description: "Automatic cashback on your monthly subscriptions, paid into your saver.",
    expires: "Sep 30, 2026",
    reason: "Matched your Subscription Manager activity",
    isNew: true,
  },
  {
    id: "off-2",
    title: "0% FX fees on your next trip",
    partner: "Lunar Travel",
    category: "travel",
    discount: "0% FX",
    description: "Spend abroad with no markup for 60 days after activation.",
    expires: "Dec 15, 2026",
    reason: "You enabled Currency Exchange",
    isNew: true,
  },
  {
    id: "off-3",
    title: "£15 off Deliveroo Plus",
    partner: "Deliveroo",
    category: "dining",
    discount: "£15 off",
    description: "Free delivery for 3 months on orders over £15.",
    expires: "Aug 1, 2026",
    reason: "Frequent dining transactions",
  },
  {
    id: "off-4",
    title: "1.5x points at Apple",
    partner: "Apple",
    category: "tech",
    discount: "1.5x points",
    description: "Bonus rewards on Apple Store and App Store purchases.",
    expires: "Oct 10, 2026",
    reason: "Tech spending in your top categories",
  },
  {
    id: "off-5",
    title: "High-yield saver: 4.8% AER",
    partner: "Lunar Saver+",
    category: "finance",
    discount: "4.8% AER",
    description: "Boost your saving goals with our promotional rate for 6 months.",
    expires: "Nov 1, 2026",
    reason: "You set Saving Goals",
    isNew: true,
  },
  {
    id: "off-6",
    title: "20% off ClassPass Premium",
    partner: "ClassPass",
    category: "wellness",
    discount: "20% off",
    description: "Three months of unlimited fitness classes near you.",
    expires: "Jul 20, 2026",
    reason: "Popular with people in your area",
  },
  {
    id: "off-7",
    title: "Investment guide: free 1:1 review",
    partner: "Lunar Wealth",
    category: "finance",
    discount: "Free review",
    description: "Book a 30-minute portfolio review with a Lunar advisor.",
    expires: "Sep 1, 2026",
    reason: "You opened the Investment Guide",
  },
  {
    id: "off-8",
    title: "£10 first ride with Bolt",
    partner: "Bolt",
    category: "travel",
    discount: "£10 off",
    description: "New Bolt customers get £10 off their first city ride.",
    expires: "Jun 1, 2026",
    reason: "Lifestyle pick for your age group",
  },
];

export function getOffersFor(_profile: UserProfile): Offer[] {
  // In a real app this would weight by spending; we just return the curated set.
  return ALL_OFFERS;
}

export function getNewOffersCount(profile: UserProfile): number {
  return getOffersFor(profile).filter((o) => o.isNew).length;
}
