import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'agenda';

export const agendaTools = [
  defineTool({
    name: 'agenda_calendars_list',
    category: CAT,
    description: 'Lista os calendarios de agenda da organizacao.',
    schema: {},
    handler: (c) => c.get('/v1/agenda/calendars'),
  }),
  defineTool({
    name: 'agenda_slots',
    category: CAT,
    description:
      'Lista horarios disponiveis (slots) de um calendario dentro de um intervalo. Datas em ISO 8601.',
    schema: {
      calendar_id: z.string().describe('ID do calendario'),
      start: z.string().describe('Inicio do intervalo (ISO 8601)'),
      end: z.string().describe('Fim do intervalo (ISO 8601)'),
      user_id: z.string().optional().describe('Filtra slots de um usuario/agente especifico'),
    },
    handler: (c, args) => c.get('/v1/agenda/slots', args),
  }),
  defineTool({
    name: 'agenda_appointments_list',
    category: CAT,
    description:
      'Lista agendamentos (appointments) dentro de um intervalo. Datas em ISO 8601.',
    schema: {
      start: z.string().describe('Inicio do intervalo (ISO 8601)'),
      end: z.string().describe('Fim do intervalo (ISO 8601)'),
      user_id: z.string().optional().describe('Filtra por usuario/agente responsavel'),
      calendar_id: z.string().optional().describe('Filtra por calendario'),
    },
    handler: (c, args) => c.get('/v1/agenda/appointments', args),
  }),
  defineTool({
    name: 'agenda_appointment_create',
    category: CAT,
    description:
      'Cria um agendamento em um calendario. Informe contact_id (ou contato com dados) e start_at em ISO 8601.',
    schema: {
      calendar_id: z.string().describe('ID do calendario'),
      start_at: z.string().describe('Inicio do agendamento (ISO 8601)'),
      title: z.string().describe('Titulo do agendamento'),
      end_at: z.string().optional().describe('Fim do agendamento (ISO 8601)'),
      contact_id: z.string().optional().describe('ID de um contato existente'),
      contato: z
        .object({
          name: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
        .optional()
        .describe('Dados de contato (quando nao houver contact_id)'),
      assignee: z.string().optional().describe('ID do usuario/agente responsavel'),
      notes: z.string().optional().describe('Observacoes do agendamento'),
    },
    handler: (c, args) => c.post('/v1/agenda/appointments', args),
  }),
  defineTool({
    name: 'agenda_appointment_cancel',
    category: CAT,
    description: 'Cancela um agendamento existente pelo ID.',
    schema: {
      id: z.string().describe('ID do agendamento'),
      reason: z.string().optional().describe('Motivo do cancelamento'),
    },
    handler: (c, { id, ...body }) => c.post(`/v1/agenda/appointments/${id}/cancel`, body),
  }),
  defineTool({
    name: 'agenda_blocks_list',
    category: CAT,
    description: 'Lista os bloqueios de agenda (periodos indisponiveis).',
    schema: {
      calendar_id: z.string().optional().describe('Filtra por calendario'),
      user_id: z.string().optional().describe('Filtra por usuario/agente'),
    },
    handler: (c, args) => c.get('/v1/agenda/blocks', args),
  }),
  defineTool({
    name: 'agenda_block_create',
    category: CAT,
    description: 'Cria um bloqueio de agenda (periodo indisponivel). Datas em ISO 8601.',
    schema: {
      start_at: z.string().describe('Inicio do bloqueio (ISO 8601)'),
      end_at: z.string().describe('Fim do bloqueio (ISO 8601)'),
      calendar_id: z.string().optional().describe('Calendario do bloqueio'),
      user_id: z.string().optional().describe('Usuario/agente do bloqueio'),
      title: z.string().optional().describe('Titulo/motivo do bloqueio'),
    },
    handler: (c, args) => c.post('/v1/agenda/blocks', args),
  }),
];
