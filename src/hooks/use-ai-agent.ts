import { useState } from 'react';

import type { NavigateOptions, ToOptions } from '@tanstack/react-router';
import OpenAI from 'openai';
import { toast } from 'sonner';

import { deleteDormCheck } from '../data/delete-dorm-check';
import { deleteDormStorage } from '../data/delete-dorm-storage';
// DELETE operations
import { deleteUser } from '../data/delete-user';
import {
  getAllFacilities,
  getFacilityById,
  useFacility,
} from '../data/facility';
import { getDormCheck } from '../data/get-dorm-check';
import { getDormStorage } from '../data/get-dorm-storage';
// API imports
import { getUser } from '../data/get-user';
import { patchDormCheck } from '../data/patch-dorm-check';
import { patchDormStorage } from '../data/patch-dorm-storage';
// PATCH operations
import { updateUser } from '../data/patch-user';
import { postDormCheck } from '../data/post-dorm-check';
import { postDormStorage } from '../data/post-dorm-storage';
// Additional POST operations
import { postUser } from '../data/post-user';
import { postUserVerify } from '../data/post-user-verify';
import {
  getAllEquipment,
  getEquipmentById,
  getEquipmentHistory,
  stopUsingEquipment,
  useEquipment,
} from '../data/research-equipment';
import {
  createWiki,
  deleteWiki,
  getWikiById,
  getWikis,
  updateWiki,
} from '../data/wiki';
import type { NavigationFunctions } from './use-agent-navigation';
import { createNavigationFunctions } from './use-agent-navigation';
import { useCurrentUser } from './use-current-user';
import { useGoogleCalendar } from './use-google-calendar';
import { useRAG } from './use-rag';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  sources?: Array<{
    title: string;
    content: string;
    wikiId: number;
    school: string;
    author?: string;
    score: number;
  }>;
  topWikiLink?: {
    title: string;
    wikiId: string;
    score: number;
  };
  functionCall?: {
    name: string;
    arguments: any;
    result: any;
  };
  usedTools?: Array<{
    name: string;
    description: string;
    success: boolean;
    args?: any;
    result?: any;
  }>;
  ragUsed?: {
    searchQuery: string;
    documentsFound: number;
  };
}

interface UseAIAgentReturn {
  messages: AgentMessage[];
  isLoading: boolean;
  sendMessage: (userInput: string) => Promise<void>;
  clearMessages: () => void;
  ragStatus: {
    isInitialized: boolean;
    isIndexing: boolean;
    documentCount: number;
    chunkCount: number;
    chunkDistribution: { [articleTitle: string]: number };
    indexingProgress: {
      current: number;
      total: number;
      status: string;
    } | null;
  };
  initializeRAG: () => Promise<void>;
  navigationFunctions?: NavigationFunctions;
}

// Available functions for the AI agent
const createAvailableFunctions = (
  navigationFunctions?: NavigationFunctions,
  googleCalendar?: ReturnType<typeof useGoogleCalendar>,
  searchDocuments?: (query: string, school?: string) => Promise<any[]>,
  user?: any,
) => ({
  search_wiki: async (query: string, school?: string) => {
    if (!searchDocuments) {
      // Return mock data for testing navigation suggestions when RAG is not initialized
      const mockResults = [
        {
          title: `Sample Article about "${query}"`,
          content: `This is a sample article that contains information about ${query}. This is just test data to demonstrate navigation suggestions.`,
          wikiId: 123,
          school: school || 'Test School',
          score: 0.8,
        },
      ];

      const topMockResult = mockResults[0];

      return JSON.stringify({
        message: `Found mock result for "${query}" (RAG not initialized)${school ? ` in ${school}` : ''}`,
        query,
        school: school || null,
        results: mockResults.map((result) => ({
          title: result.title,
          content: result.content.substring(0, 200),
          wikiId: result.wikiId,
          school: result.school,
          score: result.score,
        })),
        topWikiLink: {
          title: topMockResult.title,
          wikiId: topMockResult.wikiId.toString(),
          score: topMockResult.score,
        },
        hasNavigationSupport: !!navigationFunctions,
        isMockData: true,
      });
    }

    try {
      const searchResults =
        user?.school && !school
          ? await searchDocuments(query, user.school)
          : await searchDocuments(query, school);

      const results = searchResults.map((result) => ({
        title: result.document.metadata.title,
        content: result.document.content.substring(0, 200),
        wikiId: result.document.metadata.wikiId,
        school: result.document.metadata.school,
        score: result.score,
      }));

      // Get the top result for wiki link
      const topResult = results.length > 0 ? results[0] : null;

      return JSON.stringify({
        message: `Found ${results.length} results for "${query}"${school ? ` in ${school}` : ''}`,
        query,
        school: school || null,
        results,
        topWikiLink: topResult
          ? {
              title: topResult.title,
              wikiId: topResult.wikiId.toString(),
              score: topResult.score,
            }
          : null,
        hasNavigationSupport: !!navigationFunctions,
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to search wiki documents',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  },

  get_user_info: async () => {
    return JSON.stringify({
      message: 'Getting user information',
      action: 'get_user_info',
    });
  },

  get_current_date: async (
    format: 'full' | 'date' | 'time' | 'iso' = 'date',
  ) => {
    const now = new Date();

    switch (format) {
      case 'full':
        return JSON.stringify({
          message: 'Current date and time retrieved',
          date: now.toLocaleDateString('ko-KR'),
          time: now.toLocaleTimeString('ko-KR'),
          datetime: now.toLocaleString('ko-KR'),
          iso: now.toISOString(),
          timestamp: now.getTime(),
        });
      case 'date':
        return JSON.stringify({
          message: 'Current date retrieved',
          date: now.toISOString().split('T')[0], // YYYY-MM-DD format
          formatted: now.toLocaleDateString('ko-KR'),
        });
      case 'time':
        return JSON.stringify({
          message: 'Current time retrieved',
          time: now.toLocaleTimeString('ko-KR'),
          time24: now.toTimeString().split(' ')[0].substring(0, 5), // HH:MM format
        });
      case 'iso':
        return JSON.stringify({
          message: 'Current date and time in ISO format',
          iso: now.toISOString(),
          timestamp: now.getTime(),
        });
      default:
        return JSON.stringify({
          message: 'Current date retrieved',
          date: now.toISOString().split('T')[0],
        });
    }
  },

  create_calendar_event: async (
    title: string,
    date: string,
    time?: string,
    duration?: number,
    description?: string,
  ) => {
    if (!googleCalendar?.isAuthed) {
      return JSON.stringify({
        error: 'Google Calendar not authorized. Please sign in first.',
        needsAuth: true,
      });
    }

    try {
      const result = await googleCalendar.createQuickEvent(
        title,
        date,
        time,
        duration,
        description,
      );

      return JSON.stringify({
        message: `Calendar event "${title}" created successfully for ${date}${time ? ` at ${time}` : ' (all day)'}`,
        title,
        date,
        time: time || null,
        duration: duration || (time ? 1 : null),
        description: description || null,
        status: 'created',
        eventId: result.id,
        htmlLink: result.htmlLink,
      });
    } catch (error) {
      return JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create calendar event',
        status: 'failed',
      });
    }
  },

  list_calendar_events: async (maxResults: number = 5) => {
    if (!googleCalendar?.isAuthed) {
      return JSON.stringify({
        error: 'Google Calendar not authorized. Please sign in first.',
        needsAuth: true,
      });
    }

    try {
      const events = await googleCalendar.listUpcomingEvents(maxResults);
      return JSON.stringify({
        message: `Found ${events.length} upcoming events`,
        events: events.map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          description: event.description,
          location: event.location,
          htmlLink: event.htmlLink,
        })),
      });
    } catch (error) {
      return JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to list calendar events',
        status: 'failed',
      });
    }
  },

  check_calendar_auth: async () => {
    if (!googleCalendar) {
      return JSON.stringify({
        isAuthed: false,
        message: 'Google Calendar not initialized',
      });
    }

    return JSON.stringify({
      isAuthed: googleCalendar.isAuthed,
      isReady: googleCalendar.isReady,
      error: googleCalendar.error,
      message: googleCalendar.isAuthed
        ? 'Google Calendar is authorized and ready to use'
        : 'Google Calendar authorization required',
    });
  },

  get_weather: async (
    location: string,
    unit: 'celsius' | 'fahrenheit' = 'celsius',
  ) => {
    // Mock weather function (similar to the example)
    if (location.toLowerCase().includes('seoul')) {
      return JSON.stringify({
        location: 'Seoul',
        temperature: '15',
        unit,
        condition: 'cloudy',
      });
    } else if (location.toLowerCase().includes('busan')) {
      return JSON.stringify({
        location: 'Busan',
        temperature: '18',
        unit,
        condition: 'sunny',
      });
    } else {
      return JSON.stringify({
        location,
        temperature: 'unknown',
        condition: 'unknown',
        unit,
      });
    }
  },

  // Navigation functions
  navigate_to_page: async (page: string, wikiId?: string) => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    try {
      const result = await navigationFunctions.navigateToPage({
        page,
        ...(wikiId && { wikiId }),
      });
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : 'Navigation failed',
      });
    }
  },

  get_available_pages: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const pages = navigationFunctions.getAvailablePages();
    return JSON.stringify({ pages });
  },

  search_pages: async (keyword: string) => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const results = navigationFunctions.searchPages(keyword);
    return JSON.stringify({ results });
  },

  go_home: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goHome();
    return JSON.stringify(result);
  },

  go_to_wiki: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToWiki();
    return JSON.stringify(result);
  },

  go_to_wiki_article: async (wikiId: string) => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToWikiArticle(wikiId);
    return JSON.stringify(result);
  },

  go_to_dorm: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToDorm();
    return JSON.stringify(result);
  },

  go_to_admin: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToAdmin();
    return JSON.stringify(result);
  },

  go_to_document_parsing: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToDocumentParsing();
    return JSON.stringify(result);
  },

  // Wiki Management Functions
  get_all_wikis: async (school?: string) => {
    try {
      const wikis = await getWikis();
      const filteredWikis = school
        ? wikis.filter((w) => w.school === school)
        : wikis;
      return JSON.stringify({
        message: `Found ${filteredWikis.length} wiki articles${school ? ` for ${school}` : ''}`,
        wikis: filteredWikis.map((wiki) => ({
          id: wiki.id,
          title: wiki.title,
          school: wiki.school,
          author: wiki.author?.name || 'Unknown',
          createdAt: wiki.createdAt,
          content:
            wiki.content.substring(0, 200) +
            (wiki.content.length > 200 ? '...' : ''),
        })),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch wiki articles',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  get_wiki_by_id: async (wikiId: number) => {
    try {
      const wiki = await getWikiById(wikiId);
      if (!wiki) {
        return JSON.stringify({ error: 'Wiki article not found' });
      }
      return JSON.stringify({
        message: `Retrieved wiki article: ${wiki.title}`,
        wiki: {
          id: wiki.id,
          title: wiki.title,
          content: wiki.content,
          author: wiki.author?.name || 'Unknown',
          school: wiki.school,
          createdAt: wiki.createdAt,
          updatedAt: wiki.updatedAt,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch wiki article',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  create_wiki_article: async (title: string, content: string) => {
    try {
      const newWiki = await createWiki({ title, content });
      if (!newWiki) {
        return JSON.stringify({ error: 'Failed to create wiki article' });
      }
      return JSON.stringify({
        message: `Successfully created wiki article: ${newWiki.title}`,
        wiki: {
          id: newWiki.id,
          title: newWiki.title,
          content: newWiki.content,
          school: newWiki.school,
          createdAt: newWiki.createdAt,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to create wiki article',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  update_wiki_article: async (
    wikiId: number,
    title?: string,
    content?: string,
    comment?: string,
  ) => {
    try {
      const updateData: any = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (comment) updateData.comment = comment;

      const updatedWiki = await updateWiki(wikiId, updateData);
      if (!updatedWiki) {
        return JSON.stringify({ error: 'Failed to update wiki article' });
      }
      return JSON.stringify({
        message: `Successfully updated wiki article: ${updatedWiki.title}`,
        wiki: {
          id: updatedWiki.id,
          title: updatedWiki.title,
          content: updatedWiki.content,
          updatedAt: updatedWiki.updatedAt,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to update wiki article',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  delete_wiki_article: async (wikiId: number) => {
    try {
      const success = await deleteWiki(wikiId);
      if (!success) {
        return JSON.stringify({ error: 'Failed to delete wiki article' });
      }
      return JSON.stringify({
        message: `Successfully deleted wiki article with ID: ${wikiId}`,
        wikiId,
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to delete wiki article',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Facility Management Functions
  get_all_facilities: async () => {
    try {
      const facilities = await getAllFacilities();
      return JSON.stringify({
        message: `Found ${facilities.length} facilities`,
        facilities: facilities.map((facility: any) => ({
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: facility.location,
          isAvailable: facility.isAvailable,
          openTime: facility.openTime,
          closeTime: facility.closeTime,
        })),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch facilities',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  get_facility_by_id: async (facilityId: number) => {
    try {
      const facility = await getFacilityById(facilityId);
      return JSON.stringify({
        message: `Retrieved facility: ${facility.name}`,
        facility: {
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: facility.location,
          isAvailable: facility.isAvailable,
          openTime: facility.openTime,
          closeTime: facility.closeTime,
          imageUrl: facility.imageUrl,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch facility details',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  book_facility: async (
    facilityId: number,
    startTime: string,
    endTime: string,
  ) => {
    try {
      const booking = await useFacility(facilityId, { startTime, endTime });
      return JSON.stringify({
        message: `Successfully booked facility from ${startTime} to ${endTime}`,
        booking: {
          facilityId,
          startTime,
          endTime,
          bookingId: booking.id,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to book facility',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Research Equipment Functions
  get_all_equipment: async () => {
    try {
      const equipment = await getAllEquipment();
      return JSON.stringify({
        message: `Found ${equipment.length} research equipment items`,
        equipment: equipment.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl,
        })),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch research equipment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  get_equipment_by_id: async (equipmentId: number) => {
    try {
      const equipment = await getEquipmentById(equipmentId);
      return JSON.stringify({
        message: `Retrieved equipment: ${equipment.name}`,
        equipment: {
          id: equipment.id,
          name: equipment.name,
          description: equipment.description,
          isAvailable: equipment.isAvailable,
          imageUrl: equipment.imageUrl,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch equipment details',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  use_equipment: async (equipmentId: number) => {
    try {
      await useEquipment(equipmentId);
      return JSON.stringify({
        message: `Successfully started using equipment with ID: ${equipmentId}`,
        equipmentId,
        status: 'in_use',
        startTime: new Date().toISOString(),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to start using equipment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  stop_using_equipment: async (equipmentId: number) => {
    try {
      await stopUsingEquipment(equipmentId);
      return JSON.stringify({
        message: `Successfully stopped using equipment with ID: ${equipmentId}`,
        equipmentId,
        status: 'available',
        endTime: new Date().toISOString(),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to stop using equipment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  get_equipment_history: async (equipmentId: number) => {
    try {
      const history = await getEquipmentHistory(equipmentId);
      return JSON.stringify({
        message: `Retrieved usage history for equipment ID: ${equipmentId}`,
        equipmentId,
        history,
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch equipment history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Dormitory Management Functions
  get_dorm_checks: async () => {
    try {
      const checks = await getDormCheck();
      if (!checks) {
        return JSON.stringify({
          message: 'No dormitory check records found',
          checks: [],
        });
      }
      return JSON.stringify({
        message: `Found ${checks.length} dormitory check records`,
        checks: checks.map((check) => ({
          id: check.id,
          checkDate: check.checkAt,
          status: check.status,
          notes: check.notes,
          dorm: check.dorm,
          type: check.type,
          user: check.user.name,
        })),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch dormitory checks',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  create_dorm_check: async (
    dorm: string,
    type: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT',
    checkAt: string,
    notes?: string,
  ) => {
    try {
      await postDormCheck({ dorm, type, checkAt, notes });
      return JSON.stringify({
        message: `Successfully created dormitory check for ${dorm}`,
        check: {
          dorm,
          type,
          checkAt,
          notes: notes || null,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to create dormitory check',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  get_dorm_storage: async () => {
    try {
      const storage = await getDormStorage();
      if (!storage) {
        return JSON.stringify({
          message: 'No dormitory storage items found',
          storage: [],
        });
      }
      return JSON.stringify({
        message: `Found ${storage.length} dormitory storage items`,
        storage: storage.map((item) => ({
          id: item.id,
          storage: item.storage,
          items: item.items,
          isStored: item.isStored,
          storeAt: item.storeAt,
          user: item.user.name,
        })),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch dormitory storage',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  create_dorm_storage_item: async (
    storage: string,
    items: string,
    storeAt: string,
  ) => {
    try {
      await postDormStorage({ storage, items, storeAt });
      return JSON.stringify({
        message: `Successfully added storage item to ${storage}`,
        item: {
          storage,
          items,
          storeAt,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to add dormitory storage item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  update_dorm_check: async (
    id: number,
    status: 'FIRST_CHECK' | 'PASS' | 'SECOND_CHECK' | 'THIRD_CHECK' | 'FAIL',
    dorm?: string,
    type?: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT',
    checkAt?: string,
    notes?: string,
  ) => {
    try {
      await patchDormCheck(
        {
          status,
          dorm,
          type,
          checkAt,
          notes,
        },
        id,
      );
      return JSON.stringify({
        message: `Successfully updated dormitory check with ID: ${id}`,
        checkId: id,
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to update dormitory check',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  update_dorm_storage: async (
    id: number,
    isStored?: boolean,
    storage?: string,
    items?: string,
    storeAt?: string,
  ) => {
    try {
      const updateData: any = {};
      if (isStored !== undefined) updateData.isStored = isStored;
      if (storage) updateData.storage = storage;
      if (items) updateData.items = items;
      if (storeAt) updateData.storeAt = storeAt;

      await patchDormStorage(updateData, id);
      return JSON.stringify({
        message: `Successfully updated dormitory storage item with ID: ${id}`,
        storageId: id,
        updatedFields: Object.keys(updateData),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to update dormitory storage item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  delete_dorm_check: async (id: number) => {
    try {
      await deleteDormCheck(id);
      return JSON.stringify({
        message: `Successfully deleted dormitory check with ID: ${id}`,
        checkId: id,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to delete dormitory check',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  delete_dorm_storage: async (id: number) => {
    try {
      await deleteDormStorage(id);
      return JSON.stringify({
        message: `Successfully deleted dormitory storage item with ID: ${id}`,
        storageId: id,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to delete dormitory storage item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // User Management Functions
  get_detailed_user_info: async () => {
    try {
      const userInfo = await getUser();
      if (!userInfo) {
        return JSON.stringify({ error: 'User information not found' });
      }
      return JSON.stringify({
        message: 'Retrieved detailed user information',
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          nickname: userInfo.nickname,
          school: userInfo.school,
          number: userInfo.number,
          isAdmin: userInfo.isAdmin,
          verifyStatus: userInfo.verifyStatus,
          createdAt: userInfo.createdAt,
          updatedAt: userInfo.updatedAt,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to fetch detailed user information',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  create_user_account: async (
    email: string,
    password: string,
    name: string,
    tel: string,
    nickname: string,
    school: string,
    number: string,
  ) => {
    try {
      const newUser = await postUser({
        email,
        password,
        name,
        tel,
        nickname,
        school,
        number,
      });
      return JSON.stringify({
        message: `Successfully created user account for ${name}`,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          school: newUser.school,
          verifyStatus: newUser.verifyStatus,
          isAdmin: newUser.isAdmin,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to create user account',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  update_user_profile: async (
    password?: string,
    name?: string,
    nickname?: string,
    tel?: string,
  ) => {
    try {
      const updateData: any = {};
      if (password) updateData.password = password;
      if (name) updateData.name = name;
      if (nickname) updateData.nickname = nickname;
      if (tel) updateData.tel = tel;

      const updatedUser = await updateUser(updateData);
      return JSON.stringify({
        message: 'Successfully updated user profile',
        user: updatedUser,
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to update user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  delete_user_account: async () => {
    try {
      await deleteUser();
      return JSON.stringify({
        message: 'Successfully deleted user account',
        status: 'account_deleted',
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to delete user account',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  request_user_verification: async (verifyImageUrl: string) => {
    try {
      await postUserVerify({ verifyImageUrl });
      return JSON.stringify({
        message: 'Successfully submitted user verification request',
        verifyImageUrl,
        status: 'verification_pending',
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to request user verification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  upload_file: async (fileData: string, fileName: string, prefix?: string) => {
    try {
      // Note: This is a simplified implementation.
      // In practice, you'd need to handle file conversion from base64 or other formats
      // The fileData parameter would be used to create a File object for actual upload
      const dataLength = fileData.length;
      return JSON.stringify({
        message: `File upload initiated for ${fileName} (${dataLength} bytes)`,
        fileName,
        prefix: prefix || 'default',
        dataSize: dataLength,
        note: 'This is a simulation - actual file upload requires File object and postFilesUploadSingle API',
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

// Function definitions for OpenAI
const createTools = (
  hasNavigation: boolean = false,
  hasCalendar: boolean = false,
): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  const baseTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'search_wiki',
        description: 'Search for information in wiki documents',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for wiki documents',
            },
            school: {
              type: 'string',
              description: 'Optional school filter for search',
            },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_info',
        description: 'Get current user information',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_current_date',
        description: 'Get current date and time information',
        parameters: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['full', 'date', 'time', 'iso'],
              description:
                'Format of the date/time to return. "date" returns YYYY-MM-DD, "time" returns current time, "full" returns both, "iso" returns ISO format',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather information for a location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name or location',
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit'],
              description: 'Temperature unit',
            },
          },
          required: ['location'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_all_wikis',
        description: 'Get all wiki articles, optionally filtered by school',
        parameters: {
          type: 'object',
          properties: {
            school: {
              type: 'string',
              description: 'Optional school filter for wiki articles',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_wiki_by_id',
        description: 'Get a specific wiki article by ID',
        parameters: {
          type: 'object',
          properties: {
            wikiId: {
              type: 'number',
              description: 'ID of the wiki article to retrieve',
            },
          },
          required: ['wikiId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_wiki_article',
        description: 'Create a new wiki article',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the wiki article',
            },
            content: {
              type: 'string',
              description: 'Content of the wiki article in markdown format',
            },
          },
          required: ['title', 'content'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_wiki_article',
        description: 'Update an existing wiki article',
        parameters: {
          type: 'object',
          properties: {
            wikiId: {
              type: 'number',
              description: 'ID of the wiki article to update',
            },
            title: {
              type: 'string',
              description: 'New title for the wiki article (optional)',
            },
            content: {
              type: 'string',
              description: 'New content for the wiki article (optional)',
            },
            comment: {
              type: 'string',
              description: 'Comment describing the changes made (optional)',
            },
          },
          required: ['wikiId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'delete_wiki_article',
        description: 'Delete a wiki article (only author can delete)',
        parameters: {
          type: 'object',
          properties: {
            wikiId: {
              type: 'number',
              description: 'ID of the wiki article to delete',
            },
          },
          required: ['wikiId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_all_facilities',
        description: 'Get all available facilities that can be booked',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_facility_by_id',
        description: 'Get detailed information about a specific facility',
        parameters: {
          type: 'object',
          properties: {
            facilityId: {
              type: 'number',
              description: 'ID of the facility to retrieve',
            },
          },
          required: ['facilityId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'book_facility',
        description: 'Book a facility for a specific time period',
        parameters: {
          type: 'object',
          properties: {
            facilityId: {
              type: 'number',
              description: 'ID of the facility to book',
            },
            startTime: {
              type: 'string',
              description:
                'Start time in ISO format (e.g., "2024-01-01T10:00:00Z")',
            },
            endTime: {
              type: 'string',
              description:
                'End time in ISO format (e.g., "2024-01-01T12:00:00Z")',
            },
          },
          required: ['facilityId', 'startTime', 'endTime'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_all_equipment',
        description: 'Get all research equipment available for use',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_equipment_by_id',
        description:
          'Get detailed information about specific research equipment',
        parameters: {
          type: 'object',
          properties: {
            equipmentId: {
              type: 'number',
              description: 'ID of the equipment to retrieve',
            },
          },
          required: ['equipmentId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'use_equipment',
        description: 'Start using research equipment (marks as in use)',
        parameters: {
          type: 'object',
          properties: {
            equipmentId: {
              type: 'number',
              description: 'ID of the equipment to start using',
            },
          },
          required: ['equipmentId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'stop_using_equipment',
        description: 'Stop using research equipment (marks as available)',
        parameters: {
          type: 'object',
          properties: {
            equipmentId: {
              type: 'number',
              description: 'ID of the equipment to stop using',
            },
          },
          required: ['equipmentId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_equipment_history',
        description: 'Get usage history and statistics for research equipment',
        parameters: {
          type: 'object',
          properties: {
            equipmentId: {
              type: 'number',
              description: 'ID of the equipment to get history for',
            },
          },
          required: ['equipmentId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_dorm_checks',
        description: 'Get all dormitory check records',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_dorm_check',
        description: 'Create a new dormitory check record',
        parameters: {
          type: 'object',
          properties: {
            dorm: {
              type: 'string',
              description: 'Dormitory building name',
            },
            type: {
              type: 'string',
              enum: ['MAINTENANCE', 'SINGLE_EXIT', 'DOUBLE_EXIT'],
              description: 'Type of dormitory check',
            },
            checkAt: {
              type: 'string',
              description: 'Check date and time in ISO format',
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the check',
            },
          },
          required: ['dorm', 'type', 'checkAt'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_dorm_storage',
        description: 'Get all dormitory storage items',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_dorm_storage_item',
        description: 'Add a new item to dormitory storage',
        parameters: {
          type: 'object',
          properties: {
            itemName: {
              type: 'string',
              description: 'Name of the item to store',
            },
            quantity: {
              type: 'number',
              description: 'Quantity of the item',
            },
            location: {
              type: 'string',
              description: 'Storage location',
            },
            description: {
              type: 'string',
              description: 'Optional description of the item',
            },
          },
          required: ['itemName', 'quantity', 'location'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_detailed_user_info',
        description:
          'Get comprehensive user profile information including verification status',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_user_account',
        description: 'Create a new user account',
        parameters: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            tel: {
              type: 'string',
              description: 'User phone number',
            },
            nickname: {
              type: 'string',
              description: 'User nickname',
            },
            school: {
              type: 'string',
              description: 'User school/university',
            },
            number: {
              type: 'string',
              description: 'User student number',
            },
          },
          required: [
            'email',
            'password',
            'name',
            'tel',
            'nickname',
            'school',
            'number',
          ],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_user_profile',
        description: 'Update user profile information',
        parameters: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'New password (optional)',
            },
            name: {
              type: 'string',
              description: 'New name (optional)',
            },
            nickname: {
              type: 'string',
              description: 'New nickname (optional)',
            },
            tel: {
              type: 'string',
              description: 'New phone number (optional)',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'delete_user_account',
        description: 'Delete the current user account (permanent action)',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'request_user_verification',
        description: 'Submit a user verification request with an image URL',
        parameters: {
          type: 'object',
          properties: {
            verifyImageUrl: {
              type: 'string',
              description: 'URL of the verification image',
            },
          },
          required: ['verifyImageUrl'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'upload_file',
        description: 'Upload a file to the server',
        parameters: {
          type: 'object',
          properties: {
            fileData: {
              type: 'string',
              description: 'File data (base64 or file content)',
            },
            fileName: {
              type: 'string',
              description: 'Name of the file to upload',
            },
            prefix: {
              type: 'string',
              description: 'Optional prefix for file organization',
            },
          },
          required: ['fileData', 'fileName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_dorm_check',
        description: 'Update an existing dormitory check record',
        parameters: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID of the dormitory check to update',
            },
            status: {
              type: 'string',
              enum: [
                'FIRST_CHECK',
                'PASS',
                'SECOND_CHECK',
                'THIRD_CHECK',
                'FAIL',
              ],
              description: 'New status for the check',
            },
            dorm: {
              type: 'string',
              description: 'Dormitory building name (optional)',
            },
            type: {
              type: 'string',
              enum: ['MAINTENANCE', 'SINGLE_EXIT', 'DOUBLE_EXIT'],
              description: 'Type of check (optional)',
            },
            checkAt: {
              type: 'string',
              description: 'Check date and time in ISO format (optional)',
            },
            notes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['id', 'status'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'update_dorm_storage',
        description: 'Update an existing dormitory storage item',
        parameters: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID of the storage item to update',
            },
            isStored: {
              type: 'boolean',
              description: 'Whether the item is currently stored (optional)',
            },
            storage: {
              type: 'string',
              description: 'Storage location (optional)',
            },
            items: {
              type: 'string',
              description: 'Items description (optional)',
            },
            storeAt: {
              type: 'string',
              description: 'Store date and time in ISO format (optional)',
            },
          },
          required: ['id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'delete_dorm_check',
        description: 'Delete a dormitory check record',
        parameters: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID of the dormitory check to delete',
            },
          },
          required: ['id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'delete_dorm_storage',
        description: 'Delete a dormitory storage item',
        parameters: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID of the storage item to delete',
            },
          },
          required: ['id'],
        },
      },
    },
  ];

  const calendarTools: OpenAI.Chat.Completions.ChatCompletionTool[] =
    hasCalendar
      ? [
          {
            type: 'function',
            function: {
              name: 'create_calendar_event',
              description: 'Create a new Google Calendar event',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Event title/summary',
                  },
                  date: {
                    type: 'string',
                    description: 'Event date in YYYY-MM-DD format',
                  },
                  time: {
                    type: 'string',
                    description:
                      'Event start time in HH:MM format (optional, omit for all-day events)',
                  },
                  duration: {
                    type: 'number',
                    description:
                      'Event duration in hours (default: 1 hour, ignored for all-day events)',
                  },
                  description: {
                    type: 'string',
                    description: 'Optional event description',
                  },
                },
                required: ['title', 'date'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'list_calendar_events',
              description: 'List upcoming Google Calendar events',
              parameters: {
                type: 'object',
                properties: {
                  maxResults: {
                    type: 'number',
                    description:
                      'Maximum number of events to return (default: 5)',
                  },
                },
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'check_calendar_auth',
              description: 'Check Google Calendar authorization status',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
        ]
      : [];

  const navigationTools: OpenAI.Chat.Completions.ChatCompletionTool[] =
    hasNavigation
      ? [
          {
            type: 'function',
            function: {
              name: 'navigate_to_page',
              description: 'Navigate to a specific page in the application',
              parameters: {
                type: 'object',
                properties: {
                  page: {
                    type: 'string',
                    description:
                      'Page key or path to navigate to (e.g., "home", "wiki", "dorm", "admin")',
                  },
                  wikiId: {
                    type: 'string',
                    description:
                      'Wiki article ID (required for wiki article pages)',
                  },
                },
                required: ['page'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'get_available_pages',
              description:
                'Get list of all available pages that can be navigated to',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'search_pages',
              description: 'Search for pages by keyword',
              parameters: {
                type: 'object',
                properties: {
                  keyword: {
                    type: 'string',
                    description:
                      'Keyword to search for in page names and descriptions',
                  },
                },
                required: ['keyword'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_home',
              description: 'Navigate to the main home page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_wiki',
              description: 'Navigate to the wiki main page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_wiki_article',
              description: 'Navigate to a specific wiki article',
              parameters: {
                type: 'object',
                properties: {
                  wikiId: {
                    type: 'string',
                    description: 'ID of the wiki article to navigate to',
                  },
                },
                required: ['wikiId'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_dorm',
              description: 'Navigate to dormitory services page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_admin',
              description: 'Navigate to admin dashboard',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_document_parsing',
              description: 'Navigate to document parsing page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
        ]
      : [];

  return [...baseTools, ...calendarTools, ...navigationTools];
};

// Helper function to get tool descriptions
const getToolDescription = (toolName: string): string => {
  const descriptions: Record<string, string> = {
    search_wiki: 'Search for information in wiki documents',
    get_user_info: 'Get current user information',
    get_current_date: 'Get current date and time information',
    create_calendar_event: 'Create a Google Calendar event',
    list_calendar_events: 'List upcoming Google Calendar events',
    check_calendar_auth: 'Check Google Calendar authorization status',
    get_weather: 'Get weather information for a location',
    navigate_to_page: 'Navigate to a specific page',
    get_available_pages: 'Get list of available pages',
    search_pages: 'Search for pages by keyword',
    go_home: 'Navigate to home page',
    go_to_wiki: 'Navigate to wiki main page',
    go_to_wiki_article: 'Navigate to specific wiki article',
    go_to_dorm: 'Navigate to dormitory services',
    go_to_admin: 'Navigate to admin dashboard',
    go_to_document_parsing: 'Navigate to document parsing page',
    // Wiki management
    get_all_wikis: 'Get all wiki articles',
    get_wiki_by_id: 'Get specific wiki article by ID',
    create_wiki_article: 'Create a new wiki article',
    update_wiki_article: 'Update existing wiki article',
    delete_wiki_article: 'Delete wiki article',
    // Facility management
    get_all_facilities: 'Get all available facilities',
    get_facility_by_id: 'Get specific facility details',
    book_facility: 'Book a facility for specific time',
    // Research equipment
    get_all_equipment: 'Get all research equipment',
    get_equipment_by_id: 'Get specific equipment details',
    use_equipment: 'Start using research equipment',
    stop_using_equipment: 'Stop using research equipment',
    get_equipment_history: 'Get equipment usage history',
    // Dormitory services
    get_dorm_checks: 'Get dormitory check records',
    create_dorm_check: 'Create dormitory check record',
    get_dorm_storage: 'Get dormitory storage items',
    create_dorm_storage_item: 'Add item to dormitory storage',
    // User management
    get_detailed_user_info: 'Get detailed user profile information',
    create_user_account: 'Create a new user account',
    update_user_profile: 'Update user profile information',
    delete_user_account: 'Delete user account permanently',
    request_user_verification: 'Submit user verification request',
    upload_file: 'Upload a file to the server',
    // Enhanced dorm management
    update_dorm_check: 'Update dormitory check record',
    update_dorm_storage: 'Update dormitory storage item',
    delete_dorm_check: 'Delete dormitory check record',
    delete_dorm_storage: 'Delete dormitory storage item',
  };

  return descriptions[toolName] || `Execute ${toolName}`;
};

export function useAIAgent(
  navigate?: (options: ToOptions & NavigateOptions) => void,
): UseAIAgentReturn {
  const { user } = useCurrentUser();
  const googleCalendar = useGoogleCalendar();
  const {
    isInitialized,
    isIndexing,
    documentCount,
    chunkCount,
    chunkDistribution,
    indexingProgress,
    searchDocuments,
    initializeRAG,
  } = useRAG();

  // Create navigation functions if navigate is provided
  const navigationFunctions = navigate
    ? createNavigationFunctions(navigate)
    : undefined;

  // Create available functions with navigation, calendar, and RAG support
  const availableFunctions = createAvailableFunctions(
    navigationFunctions,
    googleCalendar,
    searchDocuments,
    user,
  );

  // Create tools with navigation and calendar support
  const tools = createTools(!!navigationFunctions, googleCalendar.isReady);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_UPSTAGE_API_KEY,
    baseURL: 'https://api.upstage.ai/v1',
    dangerouslyAllowBrowser: true,
  });

  const defaultMessage: AgentMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I'm Campass AI Agent 🤖

I'm your comprehensive university assistant that can help you with:

� **Wiki Management**
- Search, create, edit, and manage wiki articles
- Access university knowledge base

🏢 **Facility Services**
- Browse and book facilities
- Check availability and details

🔬 **Research Equipment**
- View equipment status and availability
- Reserve and manage equipment usage
- Check usage history and statistics

🏠 **Dormitory Services**
- Track, create, update, and delete room inspections
- Manage dormitory storage inventory with full CRUD operations

📅 **Calendar Management**
- Create and manage events${googleCalendar.isAuthed ? ' (authorized ✅)' : ' (authorization needed)'}
- View your schedule${
      navigationFunctions
        ? `

🧭 **Navigation**
- Navigate to different sections of the platform`
        : ''
    }

👤 **User Management**
- Access and update your profile information  
- Manage account settings and verification status
- Upload files and verification documents

🗂️ **File Operations**
- Upload and manage files on the server
- Handle verification documents and attachments

${googleCalendar.isReady && !googleCalendar.isAuthed ? '📝 *Note: To use calendar features, please authorize Google Calendar access first.*\n\n' : ''}How can I assist you today?`,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<AgentMessage[]>([defaultMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setMessages([defaultMessage]);
  };

  const executeFunction = async (
    functionName: string,
    args: any,
  ): Promise<string> => {
    try {
      switch (functionName) {
        case 'search_wiki':
          return await (availableFunctions.search_wiki as any)(
            args.query,
            args.school,
          );

        case 'get_user_info':
          return JSON.stringify({
            name: user?.name || 'Unknown',
            email: user?.email || 'Unknown',
            school: user?.school || 'Unknown',
          });

        case 'get_current_date':
          return await (availableFunctions.get_current_date as any)(
            args.format,
          );

        case 'create_calendar_event':
          return await (availableFunctions.create_calendar_event as any)(
            args.title,
            args.date,
            args.time,
            args.duration,
            args.description,
          );

        case 'list_calendar_events':
          return await (availableFunctions.list_calendar_events as any)(
            args.maxResults,
          );

        case 'check_calendar_auth':
          return await (availableFunctions.check_calendar_auth as any)();

        // Wiki management functions
        case 'get_all_wikis':
          return await (availableFunctions.get_all_wikis as any)(args.school);

        case 'get_wiki_by_id':
          return await (availableFunctions.get_wiki_by_id as any)(args.wikiId);

        case 'create_wiki_article':
          return await (availableFunctions.create_wiki_article as any)(
            args.title,
            args.content,
          );

        case 'update_wiki_article':
          return await (availableFunctions.update_wiki_article as any)(
            args.wikiId,
            args.title,
            args.content,
            args.comment,
          );

        case 'delete_wiki_article':
          return await (availableFunctions.delete_wiki_article as any)(
            args.wikiId,
          );

        // Facility management functions
        case 'get_all_facilities':
          return await (availableFunctions.get_all_facilities as any)();

        case 'get_facility_by_id':
          return await (availableFunctions.get_facility_by_id as any)(
            args.facilityId,
          );

        case 'book_facility':
          return await (availableFunctions.book_facility as any)(
            args.facilityId,
            args.startTime,
            args.endTime,
          );

        // Research equipment functions
        case 'get_all_equipment':
          return await (availableFunctions.get_all_equipment as any)();

        case 'get_equipment_by_id':
          return await (availableFunctions.get_equipment_by_id as any)(
            args.equipmentId,
          );

        case 'use_equipment':
          return await (availableFunctions.use_equipment as any)(
            args.equipmentId,
          );

        case 'stop_using_equipment':
          return await (availableFunctions.stop_using_equipment as any)(
            args.equipmentId,
          );

        case 'get_equipment_history':
          return await (availableFunctions.get_equipment_history as any)(
            args.equipmentId,
          );

        // Dormitory management functions
        case 'get_dorm_checks':
          return await (availableFunctions.get_dorm_checks as any)();

        case 'create_dorm_check':
          return await (availableFunctions.create_dorm_check as any)(
            args.roomNumber,
            args.notes,
          );

        case 'get_dorm_storage':
          return await (availableFunctions.get_dorm_storage as any)();

        case 'create_dorm_storage_item':
          return await (availableFunctions.create_dorm_storage_item as any)(
            args.itemName,
            args.quantity,
            args.location,
            args.description,
          );

        // User management functions
        case 'get_detailed_user_info':
          return await (availableFunctions.get_detailed_user_info as any)();

        case 'create_user_account':
          return await (availableFunctions.create_user_account as any)(
            args.email,
            args.password,
            args.name,
            args.tel,
            args.nickname,
            args.school,
            args.number,
          );

        case 'update_user_profile':
          return await (availableFunctions.update_user_profile as any)(
            args.password,
            args.name,
            args.nickname,
            args.tel,
          );

        case 'delete_user_account':
          return await (availableFunctions.delete_user_account as any)();

        case 'request_user_verification':
          return await (availableFunctions.request_user_verification as any)(
            args.verifyImageUrl,
          );

        case 'upload_file':
          return await (availableFunctions.upload_file as any)(
            args.fileData,
            args.fileName,
            args.prefix,
          );

        // Enhanced dorm management functions
        case 'update_dorm_check':
          return await (availableFunctions.update_dorm_check as any)(
            args.id,
            args.status,
            args.dorm,
            args.type,
            args.checkAt,
            args.notes,
          );

        case 'update_dorm_storage':
          return await (availableFunctions.update_dorm_storage as any)(
            args.id,
            args.isStored,
            args.storage,
            args.items,
            args.storeAt,
          );

        case 'delete_dorm_check':
          return await (availableFunctions.delete_dorm_check as any)(args.id);

        case 'delete_dorm_storage':
          return await (availableFunctions.delete_dorm_storage as any)(args.id);

        default:
          const func =
            availableFunctions[functionName as keyof typeof availableFunctions];
          if (func) {
            // Type-safe function calling for existing functions
            if (functionName === 'create_calendar_event') {
              return await (func as any)(
                args.title,
                args.date,
                args.time,
                args.duration,
                args.description,
              );
            } else if (functionName === 'list_calendar_events') {
              return await (func as any)(args.maxResults);
            } else if (functionName === 'check_calendar_auth') {
              return await (func as any)();
            } else if (functionName === 'get_current_date') {
              return await (func as any)(args.format);
            } else if (functionName === 'get_weather') {
              return await (func as any)(args.location, args.unit);
            } else if (functionName === 'navigate_to_page') {
              return await (func as any)(args.page, args.wikiId);
            } else if (functionName === 'search_pages') {
              return await (func as any)(args.keyword);
            } else if (functionName === 'go_to_wiki_article') {
              return await (func as any)(args.wikiId);
            }
            return await (func as any)();
          }
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      return JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const sendMessage = async (userInput: string): Promise<void> => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation messages for OpenAI
      const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [
          {
            role: 'system',
            content: `You are Campass AI Agent, a comprehensive assistant for university students and staff. You have access to various tools including wiki management, facility booking, research equipment management, dormitory services, Google Calendar management${navigationFunctions ? ', and page navigation' : ''}.

Wiki Management Features:
- get_all_wikis: List all wiki articles (optionally filtered by school)
- get_wiki_by_id: Get specific wiki article details
- create_wiki_article: Create new wiki articles
- update_wiki_article: Edit existing wiki articles
- delete_wiki_article: Delete wiki articles (author only)
- search_wiki: Search through wiki content using RAG

Facility Management Features:
- get_all_facilities: List all available facilities
- get_facility_by_id: Get detailed facility information
- book_facility: Reserve facilities for specific time periods

Research Equipment Features:
- get_all_equipment: List all research equipment
- get_equipment_by_id: Get equipment details and availability
- use_equipment: Start using equipment (marks as in-use)
- stop_using_equipment: Stop using equipment (marks as available)
- get_equipment_history: View usage history and statistics

Dormitory Services:
- get_dorm_checks: View dormitory inspection records
- create_dorm_check: Create new dormitory inspection
- get_dorm_storage: List dormitory storage items
- create_dorm_storage_item: Add items to dormitory storage

Google Calendar Features:
- create_calendar_event: Create new calendar events with date, time, and duration (Only regard event creation done when this tool is successfully called)
- list_calendar_events: List upcoming events
- check_calendar_auth: Check if user is authorized for calendar access

User Management Features:
- get_user_info: Get basic user information
- get_detailed_user_info: Get comprehensive user profile including verification status
- create_user_account: Create new user accounts (admin function)
- update_user_profile: Update user profile information (password, name, nickname, phone)
- delete_user_account: Delete user account permanently
- request_user_verification: Submit verification requests with image uploads
- upload_file: Upload files to the server

Enhanced Dormitory Management:
- get_dorm_checks: View dormitory inspection records
- create_dorm_check: Create new dormitory inspection
- update_dorm_check: Update dormitory check status and details
- delete_dorm_check: Remove dormitory check records
- get_dorm_storage: List dormitory storage items
- create_dorm_storage_item: Add items to dormitory storage
- update_dorm_storage: Update storage item information and status
- delete_dorm_storage: Remove items from dormitory storage

Date/Time Features:
- get_current_date: Get current date and time in various formats (useful for scheduling)

Wiki Search & Navigation:
- search_wiki: Search through university wiki documents
- When search results include relevant articles (score > 0.6), a smart navigation suggestion will appear above the input field
- Always mention when relevant articles are found and encourage users to click the navigation button for complete information
- Provide concise summaries from search results, but always direct users to the full articles for comprehensive details
${navigationFunctions ? '- Use navigation functions to help users move between different sections of the application' : ''}
${!googleCalendar.isAuthed ? '\nNote: User needs to authorize Google Calendar for calendar features to work.' : ''}

IMPORTANT Guidelines:
- When search results include relevant wiki articles, mention that users can click the navigation suggestions to read the full articles
- If a user asks about a topic and you find relevant wiki articles, suggest they navigate to those articles for comprehensive information
- Always provide helpful context from search results while encouraging deeper exploration through navigation
- When a user asks to navigate to a page AND search for content (e.g., "go to wiki about library"), handle both actions in sequence but provide a single comprehensive response that combines the navigation result with the search results. Do not create separate messages for each tool call.
- You can use MULTIPLE TOOLS simultaneously in a single response. Feel free to call 3 or more tools in parallel if needed to provide comprehensive assistance.
- When a user's request involves multiple actions (e.g., search, create calendar event, navigate), execute ALL relevant tools at once rather than limiting yourself to just one or two tools.
- Prioritize efficiency by using all necessary tools concurrently to provide the most helpful and complete response.

EXAMPLE MULTI-TOOL SCENARIOS:
- "Create a meeting about project planning and find related wiki articles": use create_calendar_event + search_wiki + get_current_date
- "Search for dormitory info and navigate there": use search_wiki + go_to_dorm + navigate_to_page
- "Check my calendar, get current time, and search for exam schedules": use list_calendar_events + get_current_date + search_wiki
- Always consider what combination of tools would provide the most comprehensive answer

Use the appropriate tools to provide accurate and helpful responses.${user?.school ? ` The user is from ${user.school}.` : ''}${navigationFunctions ? ' You can help users navigate to different pages in the application by using navigation functions.' : ''}

For calendar events:
- If only date is provided, create an all-day event
- If time is provided, default to 1-hour duration unless specified
- Always confirm the event details after creation
- Check authorization status if calendar operations fail`,
          },
          ...messages
            .filter((msg) => msg.role !== 'tool')
            .map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })),
          {
            role: 'user',
            content: userInput,
          },
        ];

      // Step 1: Send message with available tools
      const response = await openai.chat.completions.create({
        model: 'solar-pro2',
        messages: conversationMessages,
        tools: tools,
        tool_choice: 'auto',
        max_tokens: 1500,
        temperature: 0.8,
      });

      const responseMessage = response.choices[0].message;

      // Step 2: Check if the model wants to call functions
      if (responseMessage.tool_calls) {
        // Don't show intermediate assistant message with tool calls to user
        // Just execute functions silently

        // Execute each function call in parallel for better performance
        const functionExecutionPromises = responseMessage.tool_calls.map(
          async (toolCall) => {
            const tc = toolCall as any;
            if (!tc.function) return null;

            const functionName = tc.function.name;
            const functionArgs = JSON.parse(tc.function.arguments);

            console.log(
              `Executing function: ${functionName} with args:`,
              functionArgs,
            );

            try {
              const functionResponse = await executeFunction(
                functionName,
                functionArgs,
              );

              const toolMessage: AgentMessage = {
                id: `tool-${toolCall.id}`,
                role: 'tool',
                content: functionResponse,
                timestamp: new Date(),
                functionCall: {
                  name: functionName,
                  arguments: functionArgs,
                  result: functionResponse,
                },
              };

              // Track successful tool usage
              const usedTool = {
                name: functionName,
                description: getToolDescription(functionName),
                success: true,
                args: functionArgs,
                result: functionResponse,
              };

              return { toolMessage, usedTool };
            } catch (error) {
              // Track failed tool usage
              const usedTool = {
                name: functionName,
                description: getToolDescription(functionName),
                success: false,
                args: functionArgs,
                result:
                  error instanceof Error ? error.message : 'Unknown error',
              };

              return { toolMessage: null, usedTool };
            }
          },
        );

        // Wait for all function executions to complete
        const executionResults = await Promise.all(functionExecutionPromises);

        // Separate successful tool messages from used tools tracking
        const functionResults: AgentMessage[] = [];
        const usedTools: Array<{
          name: string;
          description: string;
          success: boolean;
          args?: any;
          result?: any;
        }> = [];

        executionResults.forEach((result) => {
          if (result) {
            if (result.toolMessage) {
              functionResults.push(result.toolMessage);
            }
            usedTools.push(result.usedTool);
          }
        });

        // Don't add intermediate function results to messages
        // setMessages((prev) => [...prev, ...functionResults]);

        // Step 3: Get final response from the model
        const finalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
          [
            ...conversationMessages,
            {
              role: 'assistant',
              content: responseMessage.content,
              tool_calls: responseMessage.tool_calls,
            },
            ...functionResults.map((result) => ({
              role: 'tool' as const,
              tool_call_id: result.id.replace('tool-', ''),
              content: result.content,
            })),
          ];

        const finalResponse = await openai.chat.completions.create({
          model: 'solar-pro2',
          messages: finalMessages,
          max_tokens: 1500,
          temperature: 0.8,
        });

        // Extract top wiki link from search_wiki results
        let topWikiLink:
          | { title: string; wikiId: string; score: number }
          | undefined;

        for (const result of functionResults) {
          if (
            result.functionCall?.name === 'search_wiki' &&
            result.functionCall?.result
          ) {
            try {
              const functionResult = JSON.parse(
                result.functionCall.result as string,
              );
              console.log(
                'Processing search wiki function result:',
                functionResult,
              );
              if (functionResult.topWikiLink) {
                topWikiLink = functionResult.topWikiLink;
                console.log('✅ Found top wiki link for UI:', topWikiLink);
                break; // Use the first (most recent) search result
              } else {
                console.log('❌ No topWikiLink in function result');
              }
            } catch (e) {
              console.error('Error parsing search_wiki result:', e);
            }
          }
        }

        console.log('Final top wiki link to be added to message:', topWikiLink);

        const finalMessage: AgentMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content:
            finalResponse.choices[0].message.content ||
            "I've completed the requested actions.",
          timestamp: new Date(),
          usedTools: usedTools.length > 0 ? usedTools : undefined,
          topWikiLink,
        };

        setMessages((prev) => [...prev, finalMessage]);
      } else {
        // No function calls, just add the regular response
        const assistantMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            responseMessage.content ||
            "I apologize, but I couldn't generate a proper response.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Agent error:', error);
      toast.error('An error occurred while processing your request');

      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I apologize, but an error occurred while processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    ragStatus: {
      isInitialized,
      isIndexing,
      documentCount,
      chunkCount,
      chunkDistribution,
      indexingProgress,
    },
    initializeRAG,
    navigationFunctions,
  };
}
