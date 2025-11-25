import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type OptimisticUpdateOptions<T> = {
  onUpdate: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
};

export function useOptimisticUpdate<T>({
  onUpdate,
  onError,
  successMessage,
  errorMessage,
}: OptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const performUpdate = useCallback(
    async (
      data: T,
      optimisticUpdate: () => void,
      revertUpdate: () => void
    ) => {
      setIsUpdating(true);
      
      // Apply optimistic update immediately
      optimisticUpdate();

      try {
        // Perform actual update
        await onUpdate(data);
        
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
      } catch (error) {
        // Revert on error
        revertUpdate();
        
        const errorMsg = error instanceof Error ? error.message : "An error occurred";
        
        toast({
          title: "Error",
          description: errorMessage || errorMsg,
          variant: "destructive",
        });

        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMsg));
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [onUpdate, onError, successMessage, errorMessage, toast]
  );

  return { performUpdate, isUpdating };
}
