import { useMutation } from "@tanstack/react-query";
import { signOut } from "@/lib/auth";

export const useLogout = () =>
  useMutation({
    mutationFn: () => signOut(),
  });
