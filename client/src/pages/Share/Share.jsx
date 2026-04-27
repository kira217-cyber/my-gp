import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgePercent,
  Check,
  Copy,
  Gift,
  Share2,
  Users,
  Wallet,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

const demoUsers = [
  { id: 1, name: "Rahim Uddin", userId: "RH8801", joined: "Today", bonus: 120 },
  {
    id: 2,
    name: "Karim Hasan",
    userId: "KR1205",
    joined: "Yesterday",
    bonus: 80,
  },
  {
    id: 3,
    name: "Sadia Akter",
    userId: "SD7712",
    joined: "2 days ago",
    bonus: 150,
  },
  {
    id: 4,
    name: "Nayeem Islam",
    userId: "NY4410",
    joined: "3 days ago",
    bonus: 60,
  },
];

const Share = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const authUser = useSelector(selectUser);
  const [copied, setCopied] = useState(false);

  const referralCode = authUser?.referralCode || "";
  const referralLink = `${import.meta.env.VITE_CLIENT_URL}/register?ref=${referralCode}`;

  const t = useMemo(
    () => ({
      title: isBangla ? "শেয়ার করুন" : "Share",
      subtitle: isBangla
        ? "বন্ধুদের আমন্ত্রণ করুন এবং বোনাস অর্জন করুন"
        : "Invite your friends and earn rewards",
      codeLabel: isBangla ? "আপনার রেফারেল লিংক" : "Your Referral Link",
      copy: isBangla ? "কপি" : "Copy",
      copied: isBangla ? "কপি হয়েছে" : "Copied",
      inviteTitle: isBangla ? "বন্ধু ইনভাইট করুন" : "Invite Friends",
      inviteText: isBangla
        ? "আপনার রেফারেল লিংক শেয়ার করুন। আপনার বন্ধু রেজিস্টার করলে আপনি কমিশন/বোনাস পেতে পারেন।"
        : "Share your referral link. When your friend registers, you can earn commission or bonus.",
      totalInvite: isBangla ? "মোট ইনভাইট" : "Total Invites",
      bonusEarned: isBangla ? "বোনাস আয়" : "Bonus Earned",
      activeUsers: isBangla ? "অ্যাক্টিভ ইউজার" : "Active Users",
      recentUsers: isBangla
        ? "সাম্প্রতিক রেফারেল ইউজার"
        : "Recent Referral Users",
      noCode: isBangla ? "রেফারেল কোড পাওয়া যায়নি" : "Referral code not found.",
      copyFailed: isBangla ? "কপি করা যায়নি" : "Copy failed.",
      currency: "TK",
    }),
    [isBangla],
  );

  const handleCopy = async () => {
    if (!referralCode) {
      toast.error(t.noCode);
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(
        isBangla ? "রেফারেল লিংক কপি হয়েছে" : "Referral link copied.",
      );
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t.copyFailed);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1f2937] mb-48">
      {/* <div className="sticky top-0 z-30 flex h-[66px] items-center justify-center bg-[#2f79c9] px-4 shadow-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>

        <h1 className="text-[22px] font-black text-white sm:text-[25px]">
          {t.title}
        </h1>
      </div> */}

      <div className="mx-auto w-full max-w-[560px] px-3 pb-8 pt-4 sm:px-4">
        <div className="mb-5 overflow-hidden rounded-[28px] bg-[#2f79c9] p-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f07a2a] text-white shadow-sm">
              <Share2 size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[24px] font-black leading-tight">
                {t.inviteTitle}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-white/80">
                {t.subtitle}
              </p>
            </div>
          </div>

          <p className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold leading-6 text-white/90">
            {t.inviteText}
          </p>
        </div>

        <div className="mb-5 rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-[#2f79c9]">
            <BadgePercent size={18} />
            <span className="text-sm font-extrabold">{t.codeLabel}</span>
          </div>

          <div className="rounded-2xl border border-[#c7d8eb] bg-[#f5f8fc] px-3 py-3">
            <p className="break-all text-[13px] font-bold leading-5 text-[#1f5f98] sm:text-[15px]">
              {referralCode ? referralLink : "N/A"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#f07a2a] text-[16px] font-black text-white transition hover:bg-[#d9651e] active:scale-[0.98]"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] bg-white p-3 text-center shadow-sm border border-[#2f79c9]/15">
            <Users className="mx-auto mb-2 text-[#2f79c9]" size={22} />
            <p className="text-[18px] font-black text-[#1f5f98]">24</p>
            <p className="text-[11px] font-bold text-gray-500">
              {t.totalInvite}
            </p>
          </div>

          <div className="rounded-[18px] bg-white p-3 text-center shadow-sm border border-[#2f79c9]/15">
            <Wallet className="mx-auto mb-2 text-[#f07a2a]" size={22} />
            <p className="text-[18px] font-black text-[#1f5f98]">
              1,250 {t.currency}
            </p>
            <p className="text-[11px] font-bold text-gray-500">
              {t.bonusEarned}
            </p>
          </div>

          <div className="rounded-[18px] bg-white p-3 text-center shadow-sm border border-[#2f79c9]/15">
            <Trophy className="mx-auto mb-2 text-[#2f79c9]" size={22} />
            <p className="text-[18px] font-black text-[#1f5f98]">18</p>
            <p className="text-[11px] font-bold text-gray-500">
              {t.activeUsers}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Gift size={20} className="text-[#f07a2a]" />
            <h3 className="text-[17px] font-black text-[#1f5f98]">
              {t.recentUsers}
            </h3>
          </div>

          <div className="space-y-3">
            {demoUsers.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#2f79c9]/10 bg-[#f5f8fc] p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f79c9] text-sm font-black text-white">
                    {item.name.slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#1f5f98]">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-gray-500">
                      {item.userId} • {item.joined}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-full bg-[#f07a2a]/10 px-3 py-1 text-xs font-black text-[#f07a2a]">
                  +{item.bonus} {t.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
