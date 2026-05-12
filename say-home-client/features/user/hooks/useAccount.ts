"use client";

import { useEffect, useState } from "react";
import { accountService } from "../services/account.service";
import type {
  DashboardProfile,
  DashboardSummary,
  RealEstateRecord,
} from "../types/account.types";

export function useAccount(userId?: number) {
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [realEstate, setRealEstate] = useState<RealEstateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setSummary(null);
      setRealEstate([]);
      return;
    }

    let mounted = true;

    const loadAccount = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, summaryData, realEstateData] = await Promise.all([
          accountService.getProfile(userId),
          accountService.getSummary(userId),
          accountService.getRealEstate(userId),
        ]);

        if (mounted) {
          setProfile(profileData);
          setSummary(summaryData);
          setRealEstate(realEstateData);
        }
      } catch (loadError) {
        if (mounted) {
          setError("Impossible de charger les donnees du compte.");
        }
        console.error(loadError);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return {
    profile,
    summary,
    realEstate,
    loading,
    error,
  };
}
