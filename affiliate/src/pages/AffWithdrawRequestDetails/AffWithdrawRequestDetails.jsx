import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { PiHandWithdrawBold } from "react-icons/pi";
import { api } from "../../api/axios";
import {
  selectUser,
  selectIsSuperAffUser,
} from "../../features/auth/authSelectors";

const money = (n, currency = "BDT") => {
  const sym = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(n || 0);

  if (Number.isNaN(num)) return `${sym} 0.00`;

  return `${sym} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }

  if (status === "rejected") {
    return "bg-red-500/15 text-red-200 border-red-400/30";
  }

  return "bg-amber-500/15 text-amber-200 border-amber-400/30";
};

const cardBase =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

const btnSecondary = `${btnBase} bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55`;

const btnApprove = `${btnBase} bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/20`;

const btnReject = `${btnBase} bg-red-500/15 text-red-200 border border-red-400/30 hover:bg-red-500/20`;

const getUserId = (user) => user?._id || user?.id || "";

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 border-b border-blue-200/10 py-3 last:border-b-0">
    <div className="text-sm font-semibold text-blue-100/60">{k}</div>
    <div className="break-all text-right text-sm font-extrabold text-white">
      {v}
    </div>
  </div>
);

const ConfirmInline = ({
  open,
  title,
  confirmText,
  confirmClass,
  loading,
  note,
  setNote,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="mt-5 rounded-3xl border border-blue-200/10 bg-black/25 p-5">
      <div className="text-base font-extrabold text-white">{title}</div>

      <div className="mt-4 text-sm font-bold text-blue-100/80">
        Admin Note (optional)
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a note for affiliate..."
        className="mt-3 min-h-[110px] w-full rounded-2xl border border-blue-200/15 bg-black/45 p-4 text-white placeholder-blue-100/35 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
      />

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={btnSecondary}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`${confirmClass} ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </div>
  );
};

const AffWithdrawRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isSuperAffUser = useSelector(selectIsSuperAffUser);
  const superAffiliateId = getUserId(user);

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const fetchOne = async () => {
    if (!isSuperAffUser || !superAffiliateId) {
      setRow(null);
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(`/api/admin/aff-withdraw-requests/${id}`, {
        params: {
          superAffiliateId,
        },
      });

      setRow(data?.data || null);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load request details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, superAffiliateId, isSuperAffUser]);

  const statusText = String(row?.status || "pending");

  const createdAt = row?.createdAt
    ? new Date(row.createdAt).toLocaleString()
    : "—";

  const approvedAt = row?.approvedAt
    ? new Date(row.approvedAt).toLocaleString()
    : "—";

  const rejectedAt = row?.rejectedAt
    ? new Date(row.rejectedAt).toLocaleString()
    : "—";

  const currency = row?.user?.currency || "BDT";

  const name = row?.user?.fullName || "No Name";
  const userId = row?.user?.userId || "—";
  const phone = row?.user?.phone || "—";
  const email = row?.user?.email || "—";

  const fields = useMemo(() => row?.fields || {}, [row]);

  const approveNow = async () => {
    if (!row?._id || !superAffiliateId) return;

    try {
      setActing(true);

      await api.patch(`/api/admin/aff-withdraw-requests/${row._id}/approve`, {
        superAffiliateId,
        adminNote: note,
      });

      toast.success("Withdraw approved successfully");

      setApproveOpen(false);
      setRejectOpen(false);
      setNote("");

      fetchOne();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!row?._id || !superAffiliateId) return;

    try {
      setActing(true);

      await api.patch(`/api/admin/aff-withdraw-requests/${row._id}/reject`, {
        superAffiliateId,
        adminNote: note,
      });

      toast.success("Withdraw rejected successfully");

      setApproveOpen(false);
      setRejectOpen(false);
      setNote("");

      fetchOne();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  if (!isSuperAffUser) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">
          <h2 className="text-xl font-extrabold text-white">Access Denied</h2>
          <p className="mt-2 text-sm text-red-100/80">
            Only super affiliate users can view affiliate withdraw request
            details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <div className={cardBase}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-800/20">
                  <PiHandWithdrawBold className="text-3xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Affiliate Withdraw Request Details
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Request ID:{" "}
                    <span className="font-bold text-white">{id}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className={btnSecondary}
              >
                <FaArrowLeft />
                Back
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-blue-100/60">Loading...</div>
          ) : !row ? (
            <div className="p-12 text-center text-blue-100/55">
              No data found.
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                  <div className="text-sm font-semibold text-blue-100/60">
                    Affiliate
                  </div>

                  <div className="mt-2 text-lg font-extrabold text-white">
                    {name}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-blue-100/55">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-[#8fc2f5]" />
                      {userId}
                    </div>

                    <div className="flex items-center gap-2">
                      <FaPhoneAlt className="text-[#8fc2f5]" />
                      {phone}
                    </div>

                    <div className="flex items-center gap-2 break-all">
                      <FaEnvelope className="text-[#8fc2f5]" />
                      {email}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                  <div className="text-sm font-semibold text-blue-100/60">
                    Method
                  </div>

                  <div className="mt-2 text-lg font-extrabold text-white">
                    {String(row?.methodId || "—").toUpperCase()}
                  </div>

                  <div className="mt-2 text-sm text-blue-100/55">
                    Created: {createdAt}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                  <div className="text-sm font-semibold text-blue-100/60">
                    Amount
                  </div>

                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-200/10 bg-black/25 px-3 py-1.5 text-sm font-extrabold text-white">
                    <FaWallet className="text-[#8fc2f5]" />
                    {money(row?.amount || 0, currency)}
                  </div>

                  <div className="mt-3 text-sm text-blue-100/55">
                    Before: {money(row?.balanceBefore || 0, currency)}
                  </div>

                  <div className="text-sm text-blue-100/55">
                    After: {money(row?.balanceAfter || 0, currency)}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                  <div className="text-sm font-semibold text-blue-100/60">
                    Status
                  </div>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${chipClass(
                        statusText,
                      )}`}
                    >
                      {statusText.toUpperCase()}
                    </span>
                  </div>

                  {statusText === "approved" ? (
                    <div className="mt-3 text-sm text-blue-100/55">
                      Approved At: {approvedAt}
                    </div>
                  ) : statusText === "rejected" ? (
                    <div className="mt-3 text-sm text-blue-100/55">
                      Rejected At: {rejectedAt}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-blue-100/55">
                      Waiting for super affiliate action
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                  <h2 className="text-lg font-bold text-[#a8d1fb]">
                    Request Info
                  </h2>

                  <div className="mt-4">
                    <FieldRow k="Method ID" v={String(row?.methodId || "—")} />
                    <FieldRow
                      k="Amount"
                      v={money(row?.amount || 0, currency)}
                    />
                    <FieldRow k="Status" v={statusText.toUpperCase()} />
                    <FieldRow k="Created At" v={createdAt} />
                    <FieldRow
                      k="Balance Before"
                      v={money(row?.balanceBefore || 0, currency)}
                    />
                    <FieldRow
                      k="Balance After"
                      v={money(row?.balanceAfter || 0, currency)}
                    />
                  </div>

                  {row?.adminNote ? (
                    <div className="mt-5 rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                      <div className="text-sm font-bold text-blue-100/80">
                        Admin Note
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-white">
                        {row.adminNote}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                  <h2 className="text-lg font-bold text-[#a8d1fb]">
                    Submitted Fields
                  </h2>

                  <div className="mt-4 rounded-2xl border border-blue-200/10 bg-black/20 p-4">
                    {fields && Object.keys(fields).length ? (
                      <div>
                        {Object.keys(fields).map((key) => (
                          <FieldRow
                            key={key}
                            k={key}
                            v={String(fields[key] ?? "")}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-sm text-blue-100/55">
                        No submitted fields found.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectOpen(false);
                    setApproveOpen((prev) => !prev);
                    setNote("");
                  }}
                  disabled={statusText !== "pending"}
                  className={
                    statusText === "pending"
                      ? btnApprove
                      : `${btnApprove} cursor-not-allowed opacity-50`
                  }
                >
                  <FaCheckCircle />
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApproveOpen(false);
                    setRejectOpen((prev) => !prev);
                    setNote("");
                  }}
                  disabled={statusText !== "pending"}
                  className={
                    statusText === "pending"
                      ? btnReject
                      : `${btnReject} cursor-not-allowed opacity-50`
                  }
                >
                  <FaTimesCircle />
                  Reject
                </button>
              </div>

              <ConfirmInline
                open={approveOpen}
                title={`Approve this request? Amount: ${money(
                  row?.amount || 0,
                  currency,
                )}`}
                confirmText="Confirm Approve"
                confirmClass={btnApprove}
                loading={acting}
                note={note}
                setNote={setNote}
                onCancel={() => {
                  if (acting) return;
                  setApproveOpen(false);
                  setNote("");
                }}
                onConfirm={approveNow}
              />

              <ConfirmInline
                open={rejectOpen}
                title="Reject this request? Rejection will refund wallet balance."
                confirmText="Confirm Reject"
                confirmClass={btnReject}
                loading={acting}
                note={note}
                setNote={setNote}
                onCancel={() => {
                  if (acting) return;
                  setRejectOpen(false);
                  setNote("");
                }}
                onConfirm={rejectNow}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffWithdrawRequestDetails;
