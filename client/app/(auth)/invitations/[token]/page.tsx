"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

function AcceptInvitationForm() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      // Accept invitation directly using token
      await api.post(`/invitations/${token}/accept`);
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/workspace");
      }, 2000);
    },
    onError: (err: unknown) => {
      const errorMessage = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Có lỗi xảy ra khi accept invitation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      // Reject invitation directly using token
      await api.post(`/invitations/${token}/reject`);
    },
    onSuccess: () => {
      router.push("/");
    },
    onError: (err: unknown) => {
      const errorMessage = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Có lỗi xảy ra khi reject invitation");
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invitations/${token}`);
    }
  }, [isAuthenticated, router, token]);

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-2xl font-bold">Invitation Accepted!</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Bạn đã được thêm vào workspace thành công. Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-2xl font-bold">Đăng nhập yêu cầu</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Vui lòng đăng nhập để accept invitation.
          </p>
          <Button
            onClick={() => router.push(`/login?redirect=/invitations/${token}`)}
            className="w-full"
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-2xl font-bold">Workspace Invitation</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Bạn đã được mời tham gia một workspace. Bạn có muốn accept invitation này không?
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => rejectMutation.mutate()}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1"
          >
            {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
          </Button>
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1"
          >
            {acceptMutation.isPending ? "Đang chấp nhận..." : "Chấp nhận"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">Đang tải...</div>
        </div>
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}

