import { useState } from "react";

export const useContact = () => {
  const [loading, setLoading] = useState(false);

  // futur: gestion envoi formulaire

  return {
    loading,
    setLoading,
  };
};