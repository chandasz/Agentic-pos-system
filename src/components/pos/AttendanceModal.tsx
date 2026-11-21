"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Delete, LogIn, LogOut, CheckCircle2, AlertCircle, ShieldAlert, User, Sparkles } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClockInSuccess: (employee: Employee) => void;
}

export function AttendanceModal({
  isOpen,
  onClose,
  onClockInSuccess,
}: AttendanceModalProps) {
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });
  const [identifiedEmployee, setIdentifiedEmployee] = useState<Employee | null>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setFeedback({ type: null, message: "" });
      setIdentifiedEmployee(null);
    }
  }, [isOpen]);

  // Handle keypad number clicks
  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length < 4) {
        setPin((prev) => prev + digit);
        setFeedback({ type: null, message: "" });
      }
    },
    [pin]
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setFeedback({ type: null, message: "" });
    setIdentifiedEmployee(null);
  }, []);

  const handleClear = useCallback(() => {
    setPin("");
    setFeedback({ type: null, message: "" });
    setIdentifiedEmployee(null);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, onClose]);

  // Check PIN automatically once 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      const checkEmployee = async () => {
        try {
          const res = await fetch("/api/pos/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin, action: "check_status" }),
          });
          const data = await res.json();
          if (data.success && data.employee) {
            setIdentifiedEmployee(data.employee);
            if (data.isClockedIn) {
              setFeedback({
                type: "info",
                message: `${data.employee.name} (${data.employee.role}) is currently Clocked In.`,
              });
            } else {
              setFeedback({
                type: "info",
                message: `Identified: ${data.employee.name} (${data.employee.role}). Ready to Clock In.`,
              });
            }
          } else {
            setIdentifiedEmployee(null);
            setFeedback({
              type: "error",
              message: data.error || "Invalid 4-digit PIN. Staff member not found.",
            });
          }
        } catch {
          setIdentifiedEmployee(null);
          setFeedback({
            type: "error",
            message: "Network error verifying PIN.",
          });
        }
      };

      checkEmployee();
    } else {
      setIdentifiedEmployee(null);
    }
  }, [pin]);

  const handleAction = async (action: "clock_in" | "clock_out") => {
    if (pin.length !== 4) {
      setFeedback({
        type: "error",
        message: "Please enter your full 4-digit PIN first.",
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const res = await fetch("/api/pos/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message,
        });

        if (action === "clock_in" && data.employee) {
          onClockInSuccess(data.employee);
        }

        // Auto close after 1.8 seconds on success
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setFeedback({
          type: "error",
          message: data.error || "Attendance action failed.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An error occurred while connecting to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Employee Attendance
            </h2>
            <p className="text-xs text-zinc-400">Enter your 4-digit staff PIN</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col items-center">
          {/* PIN Input Indicator */}
          <div className="flex items-center gap-4 mb-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-150 ${
                    isFilled
                      ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
                  }`}
                >
                  {isFilled ? "•" : ""}
                </div>
              );
            })}
          </div>

          {/* Feedback or Identified Employee banner */}
          {feedback.message ? (
            <div
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 mb-4 animate-in fade-in ${
                feedback.type === "success"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : feedback.type === "error"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
              }`}
            >
              {feedback.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {feedback.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
              {feedback.type === "info" && <Sparkles className="w-4 h-4 shrink-0" />}
              <span className="leading-snug">{feedback.message}</span>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-400 mb-4 h-8 flex items-center justify-center">
              Type on keyboard or use keypad below
            </div>
          )}

          {/* Touch Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] mb-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num.toString())}
                disabled={loading}
                className="h-12 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-lg font-semibold text-zinc-100 active:scale-95 transition-all shadow-sm border border-zinc-700/50 flex items-center justify-center cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="h-12 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/80 text-xs font-semibold text-zinc-400 active:scale-95 transition-all border border-zinc-700/40 flex items-center justify-center cursor-pointer"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleDigit("0")}
              disabled={loading}
              className="h-12 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-lg font-semibold text-zinc-100 active:scale-95 transition-all shadow-sm border border-zinc-700/50 flex items-center justify-center cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={loading}
              className="h-12 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 active:scale-95 transition-all border border-zinc-700/40 flex items-center justify-center cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons: Clock In & Clock Out */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={() => handleAction("clock_in")}
              disabled={loading || pin.length !== 4}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 shadow-md cursor-pointer ${
                pin.length === 4 && !loading
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-900/30"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Clock In</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction("clock_out")}
              disabled={loading || pin.length !== 4}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 shadow-md cursor-pointer ${
                pin.length === 4 && !loading
                  ? "bg-rose-600 hover:bg-rose-500 text-white active:scale-95 shadow-rose-900/30"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40"
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Clock Out</span>
            </button>
          </div>

          {/* Quick Seed Hint for Convenience */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 text-center w-full">
            Staff Demo PINs: <span className="font-mono text-zinc-400">1024</span> (Elena),{" "}
            <span className="font-mono text-zinc-400">2048</span> (Marcus),{" "}
            <span className="font-mono text-zinc-400">3141</span> (Aisha)
          </div>
        </div>
      </div>
    </div>
  );
}
