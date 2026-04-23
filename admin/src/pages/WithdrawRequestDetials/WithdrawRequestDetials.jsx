import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaWallet,
  FaClock,
  FaClipboardList,
} from "react-icons/fa";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved")
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (status === "rejected")
    return "bg-red-500/15 text-red-200 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const beautifyKey = (key = "") =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (m) => m.toUpperCase());

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 border-b border-blue-300/15 py-2">
    <div className="text-[12px] font-bold text-blue-100/70">
      {beautifyKey(k)}
    </div>
    <div className="break-all text-right text-[13px] font-extrabold text-white">
      {v}
    </div>
  </div>
);

const ConfirmInline = ({
  open,
  title,
  confirmText,
  confirmVariant = "approve",
  loading,
  note,
  setNote,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  const btnClass =
    confirmVariant === "reject"
      ? "from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
      : "from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db]";

  return (
    <div className="mt-4 rounded-2xl border border-blue-300/20 bg-black/40 p-4">
      <div className="text-[14px] font-extrabold text-blue-100">{title}</div>

      <div className="mt-3 text-[12px] font-bold text-blue-100/80">
        Admin Note (optional)
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a note for user..."
        className="mt-2 min-h-[90px] w-full rounded-xl border border-blue-300/20 bg-black/60 p-3 text-white placeholder-blue-100/40 outline-none focus:ring-2 focus:ring-[#2f79c9]/30"
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="cursor-pointer rounded-xl border border-blue-300/20 px-4 py-2 text-blue-100 transition hover:bg-blue-900/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`cursor-pointer rounded-xl bg-gradient-to-r px-4 py-2 font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${btnClass}`}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </div>
  );
};

const WithdrawRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const fetchOne = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/withdraw-requests/${id}`);
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
  }, [id]);

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

  const userId = row?.user?.userId || "—";
  const phone = row?.user?.phone || "";
  const email = row?.user?.email || "";

  const fields = useMemo(() => row?.fields || {}, [row]);

  const approveNow = async () => {
    if (!row?._id) return;

    try {
      setActing(true);
      await api.patch(`/api/admin/withdraw-requests/${row._id}/approve`, {
        adminNote: note,
      });
      toast.success("Withdraw approved");
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
    if (!row?._id) return;

    try {
      setActing(true);
      await api.patch(`/api/admin/withdraw-requests/${row._id}/reject`, {
        adminNote: note,
      });
      toast.success("Withdraw rejected");
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

  return (
    <div className="w-full text-white">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/40 px-4 py-2 text-[13px] font-extrabold text-blue-100 transition hover:bg-blue-900/25"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-2xl shadow-blue-900/20">
        <div className="flex items-center justify-between gap-3 border-b border-blue-300/20 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40">
              <FaClipboardList className="text-2xl" />
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-white">
                Withdraw Request Details
              </div>
              <div className="mt-1 text-[12px] text-blue-100/70">
                Request ID:{" "}
                <span className="font-bold text-blue-100">{id}</span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold ${chipClass(
              statusText,
            )}`}
          >
            {statusText.toUpperCase()}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[13px] text-blue-100/70">
            Loading...
          </div>
        ) : !row ? (
          <div className="p-10 text-center text-[13px] text-blue-100/70">
            No data found.
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white">
                    <FaUser />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-blue-100/70">
                      User
                    </div>
                    <div className="mt-1 text-[15px] font-extrabold text-white">
                      {userId}
                    </div>
                    <div className="text-[12px] text-blue-100/60">
                      {phone || "—"}
                    </div>
                    {email ? (
                      <div className="text-[12px] text-blue-100/50">
                        {email}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white">
                    <FaWallet />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-blue-100/70">
                      Amount
                    </div>
                    <div className="mt-1 text-[15px] font-extrabold text-white">
                      {money(row?.amount || 0)}
                    </div>
                    <div className="text-[12px] text-blue-100/60">
                      Method: {String(row?.methodId || "—").toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white">
                    <FaClock />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-blue-100/70">
                      Created
                    </div>
                    <div className="mt-1 text-[13px] font-extrabold text-white">
                      {createdAt}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <div className="text-[14px] font-extrabold text-blue-100">
                  Request Info
                </div>

                <div className="mt-3">
                  <FieldRow k="methodId" v={String(row?.methodId || "—")} />
                  <FieldRow k="amount" v={money(row?.amount || 0)} />
                  <FieldRow k="status" v={statusText} />
                  <FieldRow k="createdAt" v={createdAt} />
                  <FieldRow
                    k="balanceBefore"
                    v={money(row?.balanceBefore || 0)}
                  />
                  <FieldRow
                    k="balanceAfter"
                    v={money(row?.balanceAfter || 0)}
                  />
                  <FieldRow k="approvedAt" v={approvedAt} />
                  <FieldRow k="rejectedAt" v={rejectedAt} />
                </div>

                {row?.adminNote ? (
                  <div className="mt-4 rounded-2xl border border-blue-300/20 bg-black/30 p-3">
                    <div className="text-[12px] font-extrabold text-blue-100/80">
                      Admin Note
                    </div>
                    <div className="mt-1 text-[13px] text-white">
                      {row.adminNote}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <div className="text-[14px] font-extrabold text-blue-100">
                  Submitted Fields
                </div>

                <div className="mt-3 rounded-2xl border border-blue-300/15 bg-black/30 p-3">
                  {fields && Object.keys(fields).length ? (
                    Object.keys(fields).map((k) => (
                      <FieldRow key={k} k={k} v={String(fields[k] ?? "")} />
                    ))
                  ) : (
                    <div className="py-3 text-[13px] text-blue-100/70">
                      No submitted fields.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setApproveOpen((p) => !p);
                  setNote("");
                }}
                disabled={statusText !== "pending"}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-extrabold transition ${
                  statusText === "pending"
                    ? "cursor-pointer border border-emerald-400/30 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25"
                    : "cursor-not-allowed opacity-50 border border-emerald-400/20 bg-emerald-500/10 text-emerald-200/70"
                }`}
              >
                <FaCheckCircle />
                Approve
              </button>

              <button
                onClick={() => {
                  setApproveOpen(false);
                  setRejectOpen((p) => !p);
                  setNote("");
                }}
                disabled={statusText !== "pending"}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-extrabold transition ${
                  statusText === "pending"
                    ? "cursor-pointer border border-red-400/30 bg-red-500/20 text-red-200 hover:bg-red-500/25"
                    : "cursor-not-allowed opacity-50 border border-red-400/20 bg-red-500/10 text-red-200/70"
                }`}
              >
                <FaTimesCircle />
                Reject
              </button>
            </div>

            <ConfirmInline
              open={approveOpen}
              title={`Approve this request? Amount: ${money(row?.amount || 0)}`}
              confirmText="Confirm Approve"
              confirmVariant="approve"
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
              title="Reject this request? This will refund the user's balance."
              confirmText="Confirm Reject"
              confirmVariant="reject"
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
  );
};

export default WithdrawRequestDetails;
