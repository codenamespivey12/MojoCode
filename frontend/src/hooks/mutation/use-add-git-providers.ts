import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SecretsService } from "#/api/secrets-service";
import { ProviderToken } from "#/types/settings";

export const useAddGitProviders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { github: ProviderToken }) =>
      SecretsService.addGitProvider(variables),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    meta: {
      disableToast: true,
    },
  });
};
