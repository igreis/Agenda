"use client";

import { useCallback, useEffect, useState } from "react";
import { Consulta, Paciente, Atendimento } from "./types";

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/pacientes", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPacientes(data);
      } else {
        console.error("Erro ao carregar pacientes:", data);
        setPacientes([]);
      }
    } catch (err) {
      console.error("Erro de rede/requisição ao carregar pacientes:", err);
      setPacientes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const criarPaciente = useCallback(
    async (dados: Partial<Paciente>) => {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao criar paciente.");
      await recarregar();
      return res.json();
    },
    [recarregar]
  );

  const atualizarPaciente = useCallback(
    async (id: string, dados: Partial<Paciente>) => {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao atualizar paciente.");
      await recarregar();
    },
    [recarregar]
  );

  const removerPaciente = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao remover paciente.");
      await recarregar();
    },
    [recarregar]
  );

  return { pacientes: pacientes || [], carregando, recarregar, criarPaciente, atualizarPaciente, removerPaciente };
}

export function useConsultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/consultas", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setConsultas(data);
      } else {
        console.error("Erro ao carregar consultas:", data);
        setConsultas([]);
      }
    } catch (err) {
      console.error("Erro de rede/requisição ao carregar consultas:", err);
      setConsultas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const criarConsulta = useCallback(
    async (dados: Partial<Consulta>) => {
      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao criar consulta.");
      await recarregar();
      return res.json();
    },
    [recarregar]
  );

  const atualizarConsulta = useCallback(
    async (id: string, dados: Partial<Consulta>) => {
      const res = await fetch(`/api/consultas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao atualizar consulta.");
      await recarregar();
    },
    [recarregar]
  );

  const removerConsulta = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/consultas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao remover consulta.");
      await recarregar();
    },
    [recarregar]
  );

  return { consultas: consultas || [], carregando, recarregar, criarConsulta, atualizarConsulta, removerConsulta };
}

export function useAtendimentos(pacienteId?: string) {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const url = pacienteId
        ? `/api/atendimentos?pacienteId=${encodeURIComponent(pacienteId)}`
        : "/api/atendimentos";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAtendimentos(data);
      } else {
        console.error("Erro ao carregar atendimentos:", data);
        setAtendimentos([]);
      }
    } catch (err) {
      console.error("Erro de rede/requisição ao carregar atendimentos:", err);
      setAtendimentos([]);
    } finally {
      setCarregando(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const criarAtendimento = useCallback(
    async (dados: {
      consultaId: string;
      pacienteId: string;
      procedimentoRealizado: string;
      observacoes?: string;
      proximoPasso?: string;
      odontograma?: Record<number, string>;
      data?: string;
    }) => {
      const res = await fetch("/api/atendimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao registrar atendimento.");
      await recarregar();
      return res.json();
    },
    [recarregar]
  );

  const removerAtendimento = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/atendimentos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).erro ?? "Erro ao remover atendimento.");
      await recarregar();
    },
    [recarregar]
  );

  return {
    atendimentos: atendimentos || [],
    carregando,
    recarregar,
    criarAtendimento,
    removerAtendimento,
  };
}

