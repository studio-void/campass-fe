import { useState } from 'react';

import OpenAI from 'openai';
import { toast } from 'sonner';

// Import all existing API functions
import { deleteDormCheck } from '../data/delete-dorm-check';
import { deleteDormStorage } from '../data/delete-dorm-storage';
import { deleteUser } from '../data/delete-user';
import { deleteWiki } from '../data/delete-wiki';
import {
  createFacility,
  deleteFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
  useFacility,
} from '../data/facility';
import { getAppInfo } from '../data/get-app-info';
import { getDormCheck } from '../data/get-dorm-check';
import { getDormCheckById } from '../data/get-dorm-check-by-id';
import { getDormStorage } from '../data/get-dorm-storage';
import { getDormStorageById } from '../data/get-dorm-storage-by-id';
import { getUser } from '../data/get-user';
import { getAllUsers } from '../data/get-user-all';
import { getUserByEmail } from '../data/get-user-by-email';
import { getUserById } from '../data/get-user-by-id';
import { getUserVerify } from '../data/get-user-verify';
import { getWikiById } from '../data/get-wiki-by-id';
import { getWikiHistory } from '../data/get-wiki-history';
import { patchDormCheck } from '../data/patch-dorm-check';
import { patchDormStorage } from '../data/patch-dorm-storage';
import { updateUser } from '../data/patch-user';
import { updateWiki } from '../data/patch-wiki';
import { postDormCheck } from '../data/post-dorm-check';
import { postDormStorage } from '../data/post-dorm-storage';
import { postUserVerify } from '../data/post-user-verify';
import { postUserVerifyApprove } from '../data/post-user-verify-approve';
import { postUserVerifyReject } from '../data/post-user-verify-reject';
import { createWiki } from '../data/post-wiki';
import {
  createEquipment,
  deleteEquipment,
  getAllEquipment,
  getEquipmentById,
  getEquipmentHistory,
  stopUsingEquipment,
  updateEquipment,
  useEquipment,
} from '../data/research-equipment';
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from '../data/research-notes';
import { getWikis } from '../data/wiki';
import { useCurrentUser } from './use-current-user';
import { useRAG } from './use-rag';
import { type Message as BaseMessage } from './use-upstage-api';

// Tool definition for function calling
interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

// Available functions for the AI agent
const availableFunctions = {
  // Dorm Check functions
  getDormCheck: async () => {
    const result = await getDormCheck();
    return JSON.stringify(result || []);
  },

  postDormCheck: async (args: {
    dorm: string;
    type: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT';
    checkAt: string;
    notes?: string;
  }) => {
    await postDormCheck(args);
    return JSON.stringify({
      success: true,
      message: 'Dorm check created successfully',
    });
  },

  patchDormCheck: async (args: {
    id: number;
    status?: 'FIRST_CHECK' | 'PASS' | 'SECOND_CHECK' | 'THIRD_CHECK' | 'FAIL';
    dorm?: string;
    type?: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT';
    checkAt?: string;
    notes?: string;
  }) => {
    const { id, ...data } = args;
    const patchData = {
      status: data.status || 'FIRST_CHECK',
      dorm: data.dorm,
      type: data.type,
      checkAt: data.checkAt,
      notes: data.notes,
    };
    await patchDormCheck(patchData, id);
    return JSON.stringify({
      success: true,
      message: 'Dorm check updated successfully',
    });
  },

  deleteDormCheck: async (args: { id: number }) => {
    await deleteDormCheck(args.id);
    return JSON.stringify({
      success: true,
      message: 'Dorm check deleted successfully',
    });
  },

  // Dorm Storage functions
  getDormStorage: async () => {
    const result = await getDormStorage();
    return JSON.stringify(result || []);
  },

  postDormStorage: async (args: {
    storage: string;
    items: string;
    storeAt: string;
  }) => {
    await postDormStorage(args);
    return JSON.stringify({
      success: true,
      message: 'Dorm storage created successfully',
    });
  },

  patchDormStorage: async (args: {
    id: number;
    storage?: string;
    items?: string;
    storeAt?: string;
  }) => {
    const { id, ...data } = args;
    await patchDormStorage(data, id);
    return JSON.stringify({
      success: true,
      message: 'Dorm storage updated successfully',
    });
  },

  // User functions
  getUser: async () => {
    const result = await getUser();
    return JSON.stringify(result || {});
  },

  getUserVerify: async () => {
    const result = await getUserVerify();
    return JSON.stringify(result || []);
  },

  postUserVerifyApprove: async (args: { userId: number }) => {
    await postUserVerifyApprove(args.userId);
    return JSON.stringify({
      success: true,
      message: 'User verification approved',
    });
  },

  postUserVerifyReject: async (args: { userId: number }) => {
    await postUserVerifyReject(args.userId);
    return JSON.stringify({
      success: true,
      message: 'User verification rejected',
    });
  },

  // Wiki functions
  getWikis: async () => {
    const result = await getWikis();
    return JSON.stringify(result || []);
  },

  getWikiById: async (args: { id: number }) => {
    const result = await getWikiById(args.id);
    return JSON.stringify(result || {});
  },

  createWiki: async (args: { title: string; content: string }) => {
    const result = await createWiki(args);
    return JSON.stringify(result || { success: false });
  },

  updateWiki: async (args: {
    id: number;
    title?: string;
    content?: string;
    comment?: string;
  }) => {
    const result = await updateWiki(args.id, args);
    return JSON.stringify(result || { success: false });
  },

  deleteWiki: async (args: { id: number }) => {
    const success = await deleteWiki(args.id);
    return JSON.stringify({
      success,
      message: success ? 'Wiki deleted successfully' : 'Failed to delete wiki',
    });
  },

  getWikiHistory: async (args: { id: number }) => {
    const result = await getWikiHistory(args.id);
    return JSON.stringify(result || []);
  },

  // Additional API functions
  getAppInfo: async () => {
    const result = await getAppInfo();
    return JSON.stringify(result || {});
  },

  getAllUsers: async () => {
    const result = await getAllUsers();
    return JSON.stringify(result || []);
  },

  getUserById: async (args: { id: number }) => {
    const result = await getUserById(args.id);
    return JSON.stringify(result || {});
  },

  getUserByEmail: async (args: { email: string }) => {
    const result = await getUserByEmail(args.email);
    return JSON.stringify(result || {});
  },

  updateUser: async (args: {
    password?: string;
    name?: string;
    nickname?: string;
    tel?: string;
  }) => {
    const result = await updateUser(args);
    return JSON.stringify(result || { success: false });
  },

  deleteUser: async () => {
    const result = await deleteUser();
    return JSON.stringify(result || { success: false });
  },

  postUserVerify: async (args: { verifyImageUrl: string }) => {
    const result = await postUserVerify(args);
    return JSON.stringify(result || { success: false });
  },

  getDormCheckById: async (args: { id: number }) => {
    const result = await getDormCheckById(args.id);
    return JSON.stringify(result || {});
  },

  getDormStorageById: async (args: { id: number }) => {
    const result = await getDormStorageById(args.id);
    return JSON.stringify(result || {});
  },

  deleteDormStorage: async (args: { id: number }) => {
    await deleteDormStorage(args.id);
    return JSON.stringify({
      success: true,
      message: 'Dorm storage deleted successfully',
    });
  },

  // Research Equipment functions
  getAllEquipment: async () => {
    const result = await getAllEquipment();
    return JSON.stringify(result || []);
  },

  getEquipmentById: async (args: { id: number }) => {
    const result = await getEquipmentById(args.id);
    return JSON.stringify(result || {});
  },

  createEquipment: async (args: {
    name: string;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
  }) => {
    const result = await createEquipment(args);
    return JSON.stringify(result || { success: false });
  },

  updateEquipment: async (args: {
    id: number;
    name?: string;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
  }) => {
    const { id, ...data } = args;
    const result = await updateEquipment(id, data);
    return JSON.stringify(result || { success: false });
  },

  deleteEquipment: async (args: { id: number }) => {
    const result = await deleteEquipment(args.id);
    return JSON.stringify(result || { success: false });
  },

  getEquipmentHistory: async (args: { id: number }) => {
    const result = await getEquipmentHistory(args.id);
    return JSON.stringify(result || {});
  },

  useEquipment: async (args: { id: number }) => {
    const result = await useEquipment(args.id);
    return JSON.stringify(result || { success: false });
  },

  stopUsingEquipment: async (args: { id: number }) => {
    const result = await stopUsingEquipment(args.id);
    return JSON.stringify(result || { success: false });
  },

  // Research Notes functions
  getAllNotes: async () => {
    const result = await getAllNotes();
    return JSON.stringify(result || []);
  },

  getNoteById: async (args: { id: number }) => {
    const result = await getNoteById(args.id);
    return JSON.stringify(result || {});
  },

  createNote: async (args: { title: string; content: string }) => {
    const result = await createNote(args);
    return JSON.stringify(result || { success: false });
  },

  updateNote: async (args: {
    id: number;
    title?: string;
    content?: string;
  }) => {
    const { id, ...data } = args;
    const result = await updateNote(id, data);
    return JSON.stringify(result || { success: false });
  },

  deleteNote: async (args: { id: number }) => {
    const result = await deleteNote(args.id);
    return JSON.stringify(result || { success: false });
  },

  // Facility functions
  getAllFacilities: async () => {
    const result = await getAllFacilities();
    return JSON.stringify(result || []);
  },

  getFacilityById: async (args: { id: number }) => {
    const result = await getFacilityById(args.id);
    return JSON.stringify(result || {});
  },

  createFacility: async (args: {
    name: string;
    description?: string;
    imageUrl?: string;
    location: string;
    isAvailable?: boolean;
    openTime: string;
    closeTime: string;
  }) => {
    const result = await createFacility(args);
    return JSON.stringify(result || { success: false });
  },

  updateFacility: async (args: {
    id: number;
    name?: string;
    description?: string;
    imageUrl?: string;
    location?: string;
    isAvailable?: boolean;
    openTime?: string;
    closeTime?: string;
  }) => {
    const { id, ...data } = args;
    const result = await updateFacility(id, data);
    return JSON.stringify(result || { success: false });
  },

  deleteFacility: async (args: { id: number }) => {
    const result = await deleteFacility(args.id);
    return JSON.stringify(result || { success: false });
  },

  useFacility: async (args: {
    id: number;
    startTime: string;
    endTime: string;
  }) => {
    const { id, ...data } = args;
    const result = await useFacility(id, data);
    return JSON.stringify(result || { success: false });
  },
};

// Tool definitions for function calling
const tools: FunctionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getDormCheck',
      description: 'Get all dorm check records for the current user',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'postDormCheck',
      description: 'Create a new dorm check record',
      parameters: {
        type: 'object',
        properties: {
          dorm: { type: 'string', description: 'Dormitory name or location' },
          type: {
            type: 'string',
            enum: ['MAINTENANCE', 'SINGLE_EXIT', 'DOUBLE_EXIT'],
            description: 'Type of dorm check',
          },
          checkAt: {
            type: 'string',
            description: 'Date and time of check (ISO string)',
          },
          notes: {
            type: 'string',
            description: 'Optional notes for the check',
          },
        },
        required: ['dorm', 'type', 'checkAt'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'patchDormCheck',
      description: 'Update an existing dorm check record',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'ID of the dorm check to update' },
          dorm: { type: 'string', description: 'Dormitory name or location' },
          type: {
            type: 'string',
            enum: ['MAINTENANCE', 'SINGLE_EXIT', 'DOUBLE_EXIT'],
            description: 'Type of dorm check',
          },
          checkAt: {
            type: 'string',
            description: 'Date and time of check (ISO string)',
          },
          notes: {
            type: 'string',
            description: 'Optional notes for the check',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteDormCheck',
      description: 'Delete a dorm check record',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'ID of the dorm check to delete' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDormStorage',
      description: 'Get all dorm storage records for the current user',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'postDormStorage',
      description: 'Create a new dorm storage record',
      parameters: {
        type: 'object',
        properties: {
          storage: { type: 'string', description: 'Storage location or name' },
          items: { type: 'string', description: 'Items stored' },
          storeAt: {
            type: 'string',
            description: 'Date and time of storage (ISO string)',
          },
        },
        required: ['storage', 'items', 'storeAt'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'patchDormStorage',
      description: 'Update an existing dorm storage record',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'ID of the dorm storage to update',
          },
          storage: { type: 'string', description: 'Storage location or name' },
          items: { type: 'string', description: 'Items stored' },
          storeAt: {
            type: 'string',
            description: 'Date and time of storage (ISO string)',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getUser',
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
      name: 'getUserSchool',
      description: 'Get current user school information',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getUserVerify',
      description: 'Get user verification requests (admin only)',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'postUserVerifyApprove',
      description: 'Approve a user verification request (admin only)',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'number', description: 'ID of the user to approve' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'postUserVerifyReject',
      description: 'Reject a user verification request (admin only)',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'number', description: 'ID of the user to reject' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWikis',
      description: 'Get all wiki articles for the current user school',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWikiById',
      description: 'Get a specific wiki article by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'ID of the wiki article' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createWiki',
      description: 'Create a new wiki article',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the wiki article' },
          content: {
            type: 'string',
            description: 'Content of the wiki article',
          },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateWiki',
      description: 'Update an existing wiki article',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'ID of the wiki article to update',
          },
          title: {
            type: 'string',
            description: 'New title of the wiki article',
          },
          content: {
            type: 'string',
            description: 'New content of the wiki article',
          },
          comment: { type: 'string', description: 'Comment about the changes' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteWiki',
      description: 'Delete a wiki article',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'ID of the wiki article to delete',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWikiHistory',
      description: 'Get edit history for a wiki article',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'ID of the wiki article' },
        },
        required: ['id'],
      },
    },
  },
  // Additional API functions tools
  {
    type: 'function',
    function: {
      name: 'getAppInfo',
      description: 'Get basic API information',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAllUsers',
      description:
        'Get all users list (admin can see all info, normal users see basic info)',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getUserById',
      description: 'Get user information by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'User ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getUserByEmail',
      description: 'Get user information by email',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'User email' },
        },
        required: ['email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateUser',
      description: 'Update current user information',
      parameters: {
        type: 'object',
        properties: {
          password: { type: 'string', description: 'New password' },
          name: { type: 'string', description: 'Real name' },
          nickname: { type: 'string', description: 'Display nickname' },
          tel: { type: 'string', description: 'Phone number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteUser',
      description: 'Delete current user account (withdrawal)',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'verifyUser',
      description: 'Submit user verification request with student ID image',
      parameters: {
        type: 'object',
        properties: {
          verifyImageUrl: {
            type: 'string',
            description: 'URL of verification image',
          },
        },
        required: ['verifyImageUrl'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDormCheckById',
      description: 'Get detailed dorm check information by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Dorm check ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDormStorageById',
      description: 'Get detailed dorm storage information by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Dorm storage ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteDormStorage',
      description: 'Delete a dorm storage application',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Storage application ID to delete',
          },
        },
        required: ['id'],
      },
    },
  },
  // Research Equipment Tools
  {
    type: 'function',
    function: {
      name: 'getAllEquipment',
      description: 'Get all research equipment for current user school',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getEquipmentById',
      description: 'Get detailed research equipment information by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Equipment ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createEquipment',
      description: 'Create new research equipment (admin only)',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Equipment name' },
          description: { type: 'string', description: 'Equipment description' },
          imageUrl: { type: 'string', description: 'Equipment image URL' },
          isAvailable: {
            type: 'boolean',
            description: 'Whether equipment is available',
          },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateEquipment',
      description: 'Update research equipment information (admin only)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Equipment ID' },
          name: { type: 'string', description: 'Equipment name' },
          description: { type: 'string', description: 'Equipment description' },
          imageUrl: { type: 'string', description: 'Equipment image URL' },
          isAvailable: {
            type: 'boolean',
            description: 'Whether equipment is available',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteEquipment',
      description: 'Delete research equipment (admin only)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Equipment ID to delete' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getEquipmentHistory',
      description: 'Get equipment usage history and statistics',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Equipment ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'useEquipment',
      description: 'Start using research equipment',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Equipment ID to use' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'stopUsingEquipment',
      description: 'Stop using research equipment',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Equipment ID to stop using' },
        },
        required: ['id'],
      },
    },
  },
  // Research Notes Tools
  {
    type: 'function',
    function: {
      name: 'getAllNotes',
      description: 'Get all research notes for current user',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getNoteById',
      description: 'Get detailed research note by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Note ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createNote',
      description: 'Create new research note',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Note title' },
          content: { type: 'string', description: 'Note content' },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateNote',
      description: 'Update existing research note (author only)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Note ID' },
          title: { type: 'string', description: 'Note title' },
          content: { type: 'string', description: 'Note content' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteNote',
      description: 'Delete research note (author only)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Note ID to delete' },
        },
        required: ['id'],
      },
    },
  },
  // Facility Tools
  {
    type: 'function',
    function: {
      name: 'getAllFacilities',
      description: 'Get all facilities for current user school',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getFacilityById',
      description: 'Get detailed facility information by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Facility ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createFacility',
      description: 'Create new facility (admin only)',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Facility name' },
          description: { type: 'string', description: 'Facility description' },
          imageUrl: { type: 'string', description: 'Facility image URL' },
          location: { type: 'string', description: 'Facility location' },
          isAvailable: {
            type: 'boolean',
            description: 'Whether facility is available',
          },
          openTime: {
            type: 'string',
            description: 'Opening time (ISO string)',
          },
          closeTime: {
            type: 'string',
            description: 'Closing time (ISO string)',
          },
        },
        required: ['name', 'location', 'openTime', 'closeTime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateFacility',
      description: 'Update facility information (admin only)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Facility ID' },
          name: { type: 'string', description: 'Facility name' },
          description: { type: 'string', description: 'Facility description' },
          imageUrl: { type: 'string', description: 'Facility image URL' },
          location: { type: 'string', description: 'Facility location' },
          isAvailable: {
            type: 'boolean',
            description: 'Whether facility is available',
          },
          openTime: {
            type: 'string',
            description: 'Opening time (ISO string)',
          },
          closeTime: {
            type: 'string',
            description: 'Closing time (ISO string)',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteFacility',
      description: 'Delete facility (admin only)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Facility ID to delete' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'useFacility',
      description: 'Reserve facility for specific time period',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Facility ID to reserve' },
          startTime: {
            type: 'string',
            description: 'Reservation start time (ISO string)',
          },
          endTime: {
            type: 'string',
            description: 'Reservation end time (ISO string)',
          },
        },
        required: ['id', 'startTime', 'endTime'],
      },
    },
  },
];

export interface RAGMessage extends BaseMessage {
  sources?: Array<{
    title: string;
    content: string;
    wikiId: number;
    school: string;
    author?: string;
    score: number;
  }>;
  usedTools?: Array<{
    name: string;
    description: string;
    args?: any;
    result?: any;
    success: boolean;
  }>;
  ragUsed?: {
    documentsFound: number;
    searchQuery: string;
  };
}

interface UseUpstageApiWithRAGReturn {
  messages: RAGMessage[];
  isLoading: boolean;
  sendMessage: (userInput: string) => Promise<void>;
  addMessage: (message: RAGMessage) => void;
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
}

export function useUpstageApiWithRAG(): UseUpstageApiWithRAGReturn {
  const { user } = useCurrentUser();
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

  const defaultMessage: RAGMessage = {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hello! I'm Campass AI :) \n\nI'm an AI assistant that can help you with everything related to your school life. I can find relevant information from wiki documents to provide you with more accurate and useful answers.\n\nHow can I help you today?",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<RAGMessage[]>([defaultMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: RAGMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([defaultMessage]);
  };

  const buildContextFromSources = (
    sources: Array<{
      title: string;
      content: string;
      wikiId: number;
      school: string;
      author?: string;
      score: number;
    }>,
  ): string => {
    if (sources.length === 0) return '';

    let context = 'Here is relevant wiki document information:\n\n';

    sources.forEach((source, index) => {
      context += `[Document ${index + 1}] ${source.title}\n`;
      context += `School: ${source.school}\n`;
      if (source.author) {
        context += `Author: ${source.author}\n`;
      }
      context += `Content: ${source.content.substring(0, 300)}${source.content.length > 300 ? '...' : ''}\n`;
      context += `Relevance: ${(source.score * 100).toFixed(1)}%\n\n`;
    });

    context +=
      'Please answer based on the above information and cite your sources.';
    return context;
  };

  const sendMessage = async (userInput: string): Promise<void> => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: RAGMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: RAGMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Initialize tracking variables at function scope
    let sources: Array<{
      title: string;
      content: string;
      wikiId: number;
      school: string;
      author?: string;
      score: number;
    }> = [];

    let usedTools: Array<{
      name: string;
      description: string;
      args?: any;
      result?: any;
      success: boolean;
    }> = [];

    let ragUsed: { documentsFound: number; searchQuery: string } | undefined;

    try {
      // Perform RAG search (only when RAG is initialized)
      if (isInitialized) {
        try {
          const searchResults = user?.school
            ? await searchDocuments(userInput, user.school)
            : await searchDocuments(userInput);

          sources = searchResults.map((result) => ({
            title: result.document.metadata.title,
            content: result.document.content,
            wikiId: result.document.metadata.wikiId,
            school: result.document.metadata.school,
            author: result.document.metadata.author,
            score: result.score,
          }));

          // Set RAG usage info
          ragUsed = {
            documentsFound: sources.length,
            searchQuery: userInput,
          };

          console.log(
            `Found ${sources.length} relevant documents for query: "${userInput}"`,
          );
        } catch (error) {
          console.error('RAG search failed:', error);
          toast.error(
            'An error occurred while searching for relevant documents',
          );
        }
      }

      // Configure system prompt
      let systemPrompt =
        import.meta.env.VITE_UPSTAGE_SYSTEM_PROMPT ||
        'You are Campass AI, a friendly and helpful AI assistant for university students. You have access to various functions to help with dorm management, user information, and wiki operations. ALWAYS use the appropriate functions when users ask for specific actions or data. For example:\n- Use getDormCheck() when users ask about dorm checks\n- Use getUser() when users ask about their profile\n- Use getWikis() when users ask about wiki articles\n- Use createWiki() when users want to create new wiki content\n- Use postDormCheck() when users want to record a dorm check\n\nAlways try to call relevant functions to provide accurate and up-to-date information.';

      if (sources.length > 0) {
        systemPrompt += '\n\n' + buildContextFromSources(sources);
      } else if (isInitialized) {
        systemPrompt +=
          '\n\nNo wiki documents related to the current question were found. You can still use available functions to help the user.';
      } else {
        systemPrompt +=
          '\n\nRAG system is not initialized yet. You can still use available functions to help the user.';
      }

      // Configure conversation history
      const conversationMessages = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Initialize OpenAI client for Upstage Solar
      const apiKey = import.meta.env.VITE_UPSTAGE_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_UPSTAGE_API_KEY is not configured');
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.upstage.ai/v1',
        dangerouslyAllowBrowser: true,
      });

      console.log('Initializing OpenAI client with function calling...', {
        toolsCount: tools.length,
      });

      // First API call with function calling
      console.log('Making API call with tools:', {
        userInput,
        toolsCount: tools.length,
      });

      const initialResponse = await openai.chat.completions.create({
        model: 'solar-pro2',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...conversationMessages,
          {
            role: 'user',
            content: userInput,
          },
        ] as any,
        tools: tools as any,
        tool_choice: 'auto',
        max_tokens: 1500,
        temperature: 0.7,
      });

      console.log('API Response:', initialResponse);

      const responseMessage = initialResponse.choices[0].message;

      // Check if the model wants to call functions
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Add the assistant's response with tool calls to the conversation
        const messages_with_response = [
          ...conversationMessages,
          {
            role: 'user',
            content: userInput,
          },
          responseMessage,
        ];

        // Execute function calls
        console.log(
          'Executing function calls:',
          responseMessage.tool_calls?.length,
        );

        for (const toolCall of responseMessage.tool_calls) {
          const functionName = (toolCall as any).function.name;
          const functionToCall =
            availableFunctions[functionName as keyof typeof availableFunctions];

          console.log(
            `Executing function: ${functionName}`,
            (toolCall as any).function.arguments,
          );

          // Find tool description
          const toolInfo = tools.find((t) => t.function.name === functionName);
          const toolDescription =
            toolInfo?.function.description || 'No description available';

          if (functionToCall) {
            try {
              const functionArgs = JSON.parse(
                (toolCall as any).function.arguments,
              );
              const functionResponse = await functionToCall(functionArgs);

              console.log(
                `Function ${functionName} response:`,
                functionResponse,
              );

              // Parse response to get actual result
              let parsedResult;
              try {
                parsedResult = JSON.parse(functionResponse);
              } catch {
                parsedResult = functionResponse;
              }

              // Add to used tools tracking
              usedTools.push({
                name: functionName,
                description: toolDescription,
                args: functionArgs,
                result: parsedResult,
                success: true,
              });

              // Add function response to conversation
              messages_with_response.push({
                tool_call_id: (toolCall as any).id,
                role: 'tool',
                name: functionName,
                content: functionResponse,
              } as any);
            } catch (error) {
              console.error(`Error executing function ${functionName}:`, error);
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';

              // Add failed tool to tracking
              usedTools.push({
                name: functionName,
                description: toolDescription,
                args: JSON.parse((toolCall as any).function.arguments || '{}'),
                result: {
                  error: 'Function execution failed',
                  details: errorMessage,
                },
                success: false,
              });

              messages_with_response.push({
                tool_call_id: (toolCall as any).id,
                role: 'tool',
                name: functionName,
                content: JSON.stringify({
                  error: 'Function execution failed',
                  details: errorMessage,
                }),
              } as any);
            }
          } else {
            console.error(
              `Function ${functionName} not found in availableFunctions`,
            );

            // Add missing function to tracking
            usedTools.push({
              name: functionName,
              description: 'Function not found',
              args: JSON.parse((toolCall as any).function.arguments || '{}'),
              result: { error: 'Function not found' },
              success: false,
            });

            messages_with_response.push({
              tool_call_id: (toolCall as any).id,
              role: 'tool',
              name: functionName,
              content: JSON.stringify({ error: 'Function not found' }),
            } as any);
          }
        }

        // Get final response from the model with function results
        console.log('Getting final response with function results...', {
          messagesCount: messages_with_response.length,
        });

        // Try non-streaming first for function calling response
        try {
          const finalResponse = await openai.chat.completions.create({
            model: 'solar-pro2',
            messages: messages_with_response as any,
            max_tokens: 1500,
            temperature: 0.7,
            stream: false, // Use non-streaming for function calling responses
          });

          const finalContent = finalResponse.choices[0]?.message?.content || '';
          console.log('Function calling response content:', finalContent);

          if (finalContent) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: finalContent,
                      sources: sources.length > 0 ? sources : undefined,
                      usedTools: usedTools.length > 0 ? usedTools : undefined,
                      ragUsed: ragUsed,
                    }
                  : msg,
              ),
            );
          } else {
            // Fallback: create a response based on function results
            const functionResults = messages_with_response
              .filter((msg) => msg.role === 'tool')
              .map((msg) => {
                try {
                  const content = (msg as any).content;
                  const name = (msg as any).name;
                  const result = content ? JSON.parse(content) : {};
                  return { function: name, result };
                } catch {
                  return {
                    function: (msg as any).name,
                    result: (msg as any).content,
                  };
                }
              });

            let fallbackContent =
              'I was able to retrieve the information successfully:\n\n';

            functionResults.forEach(({ function: funcName, result }) => {
              if (
                funcName === 'getUser' &&
                typeof result === 'object' &&
                result.name
              ) {
                fallbackContent += `**Your Profile Information:**\n`;
                fallbackContent += `- Name: ${result.name}\n`;
                fallbackContent += `- Email: ${result.email}\n`;
                fallbackContent += `- School: ${result.school}\n`;
                fallbackContent += `- Student ID: ${result.number}\n`;
                fallbackContent += `- Verification Status: ${result.verifyStatus}\n`;
              } else if (funcName === 'getDormCheck' && Array.isArray(result)) {
                fallbackContent += `**Dorm Check Records:** ${result.length} records found\n`;
              } else if (
                funcName === 'getDormStorage' &&
                Array.isArray(result)
              ) {
                fallbackContent += `**Dorm Storage Records:** ${result.length} records found\n`;
              } else if (funcName === 'getWikis' && Array.isArray(result)) {
                fallbackContent += `**Wiki Articles:** ${result.length} articles found\n`;
              } else {
                fallbackContent += `**${funcName}:** Retrieved successfully\n`;
              }
            });

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: fallbackContent,
                      sources: sources.length > 0 ? sources : undefined,
                      usedTools: usedTools.length > 0 ? usedTools : undefined,
                      ragUsed: ragUsed,
                    }
                  : msg,
              ),
            );
          }
        } catch (streamError) {
          console.error('Error with function calling response:', streamError);

          // Final fallback
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content:
                      'I was able to retrieve the information, but encountered an issue generating the response. Please try asking your question in a different way.',
                    sources: sources.length > 0 ? sources : undefined,
                    usedTools: usedTools.length > 0 ? usedTools : undefined,
                    ragUsed: ragUsed,
                  }
                : msg,
            ),
          );
        }
      } else {
        // No function calls - handle as regular streaming response
        const response = await fetch(
          'https://api.upstage.ai/v1/solar/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_UPSTAGE_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'solar-pro2',
              messages: [
                {
                  role: 'system',
                  content: systemPrompt,
                },
                ...conversationMessages,
                {
                  role: 'user',
                  content: userInput,
                },
              ],
              max_tokens: 1500,
              temperature: 0.7,
              stream: true,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let hasContent = false;

        if (!reader) {
          throw new Error('Unable to read stream.');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  fullContent += content;
                  hasContent = true;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content: fullContent,
                            sources: sources.length > 0 ? sources : undefined,
                            ragUsed: ragUsed,
                          }
                        : msg,
                    ),
                  );
                }
              } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                continue;
              }
            }
          }
        }

        console.log('Regular streaming completed:', {
          hasContent,
          fullContentLength: fullContent.length,
        });
      }

      // Check if we got any content after all processing
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const messageIndex = updatedMessages.findIndex(
          (msg) => msg.id === assistantMessageId,
        );

        if (messageIndex !== -1) {
          const currentMessage = updatedMessages[messageIndex];

          // If no content was generated, provide a helpful fallback
          if (!currentMessage.content || currentMessage.content.trim() === '') {
            console.log('No content generated, providing fallback response');
            updatedMessages[messageIndex] = {
              ...currentMessage,
              content:
                'I was able to retrieve the information, but encountered an issue generating the response. Please try asking your question in a different way.',
              sources: sources.length > 0 ? sources : undefined,
            };
          }
        }

        return updatedMessages;
      });
    } catch (error) {
      console.error('Upstage API error:', error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  'An unexpected error occurred. Please try again later.',
                usedTools: usedTools.length > 0 ? usedTools : undefined,
                ragUsed: ragUsed,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    addMessage,
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
  };
}
