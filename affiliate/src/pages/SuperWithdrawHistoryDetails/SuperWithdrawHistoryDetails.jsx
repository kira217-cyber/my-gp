import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaArrowLeft, FaWallet, FaInfoCircle } from "react-icons/fa";

import { api } from "../../api/axios";
import {
  selectUser,
  selectIsAuthenticated,
  selectIsSuperAffUser,
} from "../../features/auth/authSelectors";

const getUserId = (user) => user?._id || user?.id || "";

const symbolByCurrency = (c) =>
  String(c || "BDT").toUpperCase() === "USDT" ? "$" : "৳";

const money = (n, sym = "৳") => {
  const num = Number(n || 0);

  if (!Number.isFinite(num)) return `${sym} 0.00`;

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

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 border-b border-blue-200/10 py-3 last:border-b-0">
    <div className="text-sm font-semibold text-blue-100/60">{k}</div>
    <div className="break-all text-right text-sm font-extrabold text-white">
      {v || "—"}
    </div>
  </div>
);

const SuperWithdrawHistoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);
  const isSuperAffUser = useSelector(selectIsSuperAffUser);

  const userId = getUserId(user);
  const accountOk = !!isAuthed && !!userId && isSuperAffUser;

  const sym = useMemo(
    () => symbolByCurrency(user?.currency || "BDT"),
    [user?.currency],
  );

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOne = async () => {
    if (!accountOk) {
      setRow(null);
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(
        `/api/super-aff-withdraw-requests/my/${id}`,
        {
          params: {
            userId,
          },
        },
      );

      setRow(data?.data || data || null);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load withdraw details",
      );
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userId, accountOk]);

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

  const fields = useMemo(() => row?.fields || {}, [row]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <div className={cardBase}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Super Withdraw History Details
                </div>

                <div className="mt-1 text-sm text-blue-100/75">
                  Request ID: <span className="font-bold text-white">{id}</span>
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

          {!isAuthed ? (
            <div className="p-12 text-center text-sm text-amber-200">
              Please login to view withdraw details.
            </div>
          ) : !isSuperAffUser ? (
            <div className="p-12 text-center text-sm text-red-200">
              Only super affiliate users can view withdraw details.
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-sm text-blue-100/60">
              Loading...
            </div>
          ) : !row ? (
            <div className="p-12 text-center text-sm text-blue-100/55">
              No data found.
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                  <div className="text-sm font-semibold text-blue-100/60">
                    Amount
                  </div>

                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-200/10 bg-black/25 px-3 py-1.5 text-sm font-extrabold text-white">
                    <FaWallet className="text-[#8fc2f5]" />
                    {money(row?.amount || 0, sym)}
                  </div>

                  <div className="mt-3 text-sm text-blue-100/55">
                    Method: {String(row?.methodId || "—").toUpperCase()}
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

                  <div className="mt-3 text-sm text-blue-100/55">
                    Created: {createdAt}
                  </div>

                  {statusText === "approved" && (
                    <div className="mt-1 text-sm text-blue-100/55">
                      Approved: {approvedAt}
                    </div>
                  )}

                  {statusText === "rejected" && (
                    <div className="mt-1 text-sm text-blue-100/55">
                      Rejected: {rejectedAt}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                  <div className="text-sm font-semibold text-blue-100/60">
                    Balance Snapshot
                  </div>

                  <div className="mt-2 text-sm text-white">
                    Before: {money(row?.balanceBefore || 0, sym)}
                  </div>

                  <div className="text-sm text-white">
                    After: {money(row?.balanceAfter || 0, sym)}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                  <div className="text-lg font-extrabold text-[#a8d1fb]">
                    Request Info
                  </div>

                  <div className="mt-4">
                    <FieldRow k="Method ID" v={row?.methodId} />
                    <FieldRow k="Status" v={statusText.toUpperCase()} />
                    <FieldRow k="Created At" v={createdAt} />
                    <FieldRow k="Amount" v={money(row?.amount || 0, sym)} />
                    <FieldRow
                      k="Balance Before"
                      v={money(row?.balanceBefore || 0, sym)}
                    />
                    <FieldRow
                      k="Balance After"
                      v={money(row?.balanceAfter || 0, sym)}
                    />
                  </div>

                  {row?.adminNote ? (
                    <div className="mt-5 rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-[#8fc2f5]">
                          <FaInfoCircle />
                        </div>

                        <div>
                          <div className="text-sm font-extrabold text-blue-100/85">
                            Admin Note
                          </div>

                          <div className="mt-2 whitespace-pre-wrap text-sm text-white">
                            {row.adminNote}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                  <div className="text-lg font-extrabold text-[#a8d1fb]">
                    Submitted Fields
                  </div>

                  <div className="mt-4 rounded-2xl border border-blue-200/10 bg-black/20 p-4">
                    {fields && Object.keys(fields).length ? (
                      Object.keys(fields).map((key) => (
                        <FieldRow
                          key={key}
                          k={key}
                          v={String(fields[key] ?? "")}
                        />
                      ))
                    ) : (
                      <div className="py-4 text-sm text-blue-100/55">
                        No submitted fields.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperWithdrawHistoryDetails;
