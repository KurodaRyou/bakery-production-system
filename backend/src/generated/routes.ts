/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WorkflowTemplatesController } from './../routes/workClock';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WorkdaySlotsController } from './../routes/workClock';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ShiftsController } from './../routes/workClock';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from './../routes/users';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RecordsController } from './../routes/records';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductsController } from './../routes/products';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PreparationsController } from './../routes/preparations';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { IngredientsController } from './../routes/materials';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MaterialsController } from './../routes/materials';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MachinesController } from './../routes/lookups';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DoughTypesController } from './../routes/lookups';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PreparationTypesController } from './../routes/lookups';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DoughRecipesController } from './../routes/dough';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CsrfController } from './../routes/csrf';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../routes/auth';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "WorkflowTemplate": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "user_id": {"dataType":"double"},
            "steps": {"dataType":"any","required":true},
            "is_active": {"dataType":"double","required":true},
            "created_at": {"dataType":"string"},
            "updated_at": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WorkdaySlot": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "date": {"dataType":"string","required":true},
            "user_id": {"dataType":"double","required":true},
            "slot_index": {"dataType":"double","required":true},
            "task_type": {"dataType":"string"},
            "product_id": {"dataType":"double"},
            "description": {"dataType":"string"},
            "duration_slots": {"dataType":"double"},
            "is_temporary": {"dataType":"double","required":true},
            "status": {"dataType":"string","required":true},
            "created_at": {"dataType":"string"},
            "updated_at": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Shift": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "start": {"dataType":"string","required":true},
            "end": {"dataType":"string","required":true},
            "start_slot": {"dataType":"double","required":true},
            "end_slot": {"dataType":"double","required":true},
            "next_day": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "username": {"dataType":"string","required":true},
            "name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "role": {"dataType":"string","required":true},
            "can_view_recipes": {"dataType":"double","required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "timezone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateUserRequest": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "role": {"dataType":"string"},
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateUserRequest": {
        "dataType": "refObject",
        "properties": {
            "role": {"dataType":"string","required":true},
            "can_view_recipes": {"dataType":"double","required":true},
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MixingRecord": {
        "dataType": "refObject",
        "properties": {
            "batch_number": {"dataType":"string","required":true},
            "dough_name": {"dataType":"string","required":true},
            "dry_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "room_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "ice_ratio": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "water_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "flour_amount": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "water_amount": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "dough_weight": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "machine_speed": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "gluten_level": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "output_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "machine": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "operator": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "bulk_ferment_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "bulk_ferment_time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "updated_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "timezone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expected_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecordsListResponse": {
        "dataType": "refObject",
        "properties": {
            "records": {"dataType":"array","array":{"dataType":"refObject","ref":"MixingRecord"},"required":true},
            "total": {"dataType":"double","required":true},
            "limit": {"dataType":"double","required":true},
            "offset": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateRecordRequest": {
        "dataType": "refObject",
        "properties": {
            "batch_number": {"dataType":"string","required":true},
            "dough_name": {"dataType":"string","required":true},
            "dry_temp": {"dataType":"double"},
            "room_temp": {"dataType":"double"},
            "ice_ratio": {"dataType":"double"},
            "water_temp": {"dataType":"double"},
            "flour_amount": {"dataType":"double"},
            "water_amount": {"dataType":"double"},
            "machine_speed": {"dataType":"string"},
            "gluten_level": {"dataType":"double"},
            "output_temp": {"dataType":"double"},
            "machine": {"dataType":"string"},
            "operator": {"dataType":"string"},
            "bulk_ferment_temp": {"dataType":"double"},
            "bulk_ferment_time": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateRecordRequest": {
        "dataType": "refObject",
        "properties": {
            "dough_name": {"dataType":"string"},
            "dry_temp": {"dataType":"double"},
            "room_temp": {"dataType":"double"},
            "ice_ratio": {"dataType":"double"},
            "water_temp": {"dataType":"double"},
            "flour_amount": {"dataType":"double"},
            "water_amount": {"dataType":"double"},
            "dough_weight": {"dataType":"double"},
            "machine_speed": {"dataType":"string"},
            "gluten_level": {"dataType":"double"},
            "output_temp": {"dataType":"double"},
            "machine": {"dataType":"string"},
            "operator": {"dataType":"string"},
            "bulk_ferment_temp": {"dataType":"double"},
            "bulk_ferment_time": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Product": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "dough_id": {"dataType":"double"},
            "other_ingredients": {"dataType":"any"},
            "description": {"dataType":"string"},
            "created_at": {"dataType":"string"},
            "updated_at": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PreparationIngredient": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double"},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "percentage": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "stage": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "note": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "unit": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "material_name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Preparation": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "current_version": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "updated_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "version": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "ingredients": {"dataType":"array","array":{"dataType":"refObject","ref":"PreparationIngredient"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePreparationResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "material_id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "version": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePreparationRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ingredients": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"loss_rate":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"unit":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"note":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"percentage":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"stage":{"dataType":"string"},"material_id":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}],"required":true}}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePreparationResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "version": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePreparationRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ingredients": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"loss_rate":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"unit":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"note":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"percentage":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"stage":{"dataType":"string"},"material_id":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}],"required":true}}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PreparationVersion": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "preparation_id": {"dataType":"double","required":true},
            "version_number": {"dataType":"string","required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PreparationVersionIngredient": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "stage": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "percentage": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "note": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "unit": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ingredient": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "material_id": {"dataType":"double"},
            "type": {"dataType":"string","required":true},
            "default_unit": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "manufacturer": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "spec": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "price": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateIngredientRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "type": {"dataType":"string"},
            "default_unit": {"dataType":"string"},
            "manufacturer": {"dataType":"string"},
            "spec": {"dataType":"string"},
            "price": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Material": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "type": {"dataType":"string","required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateMaterialRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "type": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Machine": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DoughType": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "material_id": {"dataType":"double"},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PreparationType": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "material_id": {"dataType":"double"},
            "description": {"dataType":"string"},
            "created_at": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DoughRecipe": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "current_version": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "updated_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DoughRecipeIngredient": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double"},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "stage": {"dataType":"string","required":true},
            "percentage": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "note": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "unit": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DoughRecipeDetail": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "current_version": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "updated_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "material_type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "ingredients": {"dataType":"array","array":{"dataType":"refObject","ref":"DoughRecipeIngredient"},"required":true},
            "expected_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDoughRecipeResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "id": {"dataType":"double","required":true},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "related_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "version": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDoughRecipeRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["dough"]},{"dataType":"enum","enums":["preparation"]}],"required":true},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ingredients": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"loss_rate":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"unit":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"note":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"percentage":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"stage":{"dataType":"string"},"material_id":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}],"required":true}}}},
            "expected_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDoughRecipeResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "version": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDoughRecipeRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "material_id": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}]},
            "author": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ingredients": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"loss_rate":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"unit":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"note":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"percentage":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"stage":{"dataType":"string"},"material_id":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}],"required":true}}}},
            "expected_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "loss_rate": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}]},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VersionInfo": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "dough_id": {"dataType":"double","required":true},
            "version_number": {"dataType":"string","required":true},
            "expected_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DoughRecipeVersion": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "dough_id": {"dataType":"double","required":true},
            "version_number": {"dataType":"string","required":true},
            "expected_temp": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "ingredients": {"dataType":"array","array":{"dataType":"refObject","ref":"DoughRecipeIngredient"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RestoreResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "version": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthResponse": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "role": {"dataType":"string","required":true},
            "canViewRecipes": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequest": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserProfile": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"double","required":true},
            "username": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "role": {"dataType":"string","required":true},
            "canViewRecipes": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProfileUpdateResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "loggedOut": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProfileRequest": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string"},
            "password": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"silently-remove-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsWorkflowTemplatesController_listWorkflowTemplates: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/workflow-templates',
            ...(fetchMiddlewares<RequestHandler>(WorkflowTemplatesController)),
            ...(fetchMiddlewares<RequestHandler>(WorkflowTemplatesController.prototype.listWorkflowTemplates)),

            async function WorkflowTemplatesController_listWorkflowTemplates(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkflowTemplatesController_listWorkflowTemplates, request, response });

                const controller = new WorkflowTemplatesController();

              await templateService.apiHandler({
                methodName: 'listWorkflowTemplates',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkflowTemplatesController_createWorkflowTemplate: Record<string, TsoaRoute.ParameterSchema> = {
                _body: {"in":"body","name":"_body","required":true,"dataType":"any"},
        };
        app.post('/api/workflow-templates',
            ...(fetchMiddlewares<RequestHandler>(WorkflowTemplatesController)),
            ...(fetchMiddlewares<RequestHandler>(WorkflowTemplatesController.prototype.createWorkflowTemplate)),

            async function WorkflowTemplatesController_createWorkflowTemplate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkflowTemplatesController_createWorkflowTemplate, request, response });

                const controller = new WorkflowTemplatesController();

              await templateService.apiHandler({
                methodName: 'createWorkflowTemplate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkdaySlotsController_listWorkdaySlots: Record<string, TsoaRoute.ParameterSchema> = {
                _date: {"in":"query","name":"_date","required":true,"dataType":"string"},
                _user_id: {"in":"query","name":"_user_id","required":true,"dataType":"double"},
        };
        app.get('/api/workday-slots',
            ...(fetchMiddlewares<RequestHandler>(WorkdaySlotsController)),
            ...(fetchMiddlewares<RequestHandler>(WorkdaySlotsController.prototype.listWorkdaySlots)),

            async function WorkdaySlotsController_listWorkdaySlots(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkdaySlotsController_listWorkdaySlots, request, response });

                const controller = new WorkdaySlotsController();

              await templateService.apiHandler({
                methodName: 'listWorkdaySlots',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkdaySlotsController_createWorkdaySlot: Record<string, TsoaRoute.ParameterSchema> = {
                _body: {"in":"body","name":"_body","required":true,"dataType":"any"},
        };
        app.post('/api/workday-slots',
            ...(fetchMiddlewares<RequestHandler>(WorkdaySlotsController)),
            ...(fetchMiddlewares<RequestHandler>(WorkdaySlotsController.prototype.createWorkdaySlot)),

            async function WorkdaySlotsController_createWorkdaySlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkdaySlotsController_createWorkdaySlot, request, response });

                const controller = new WorkdaySlotsController();

              await templateService.apiHandler({
                methodName: 'createWorkdaySlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkdaySlotsController_updateWorkdaySlot: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                _body: {"in":"body","name":"_body","required":true,"dataType":"any"},
        };
        app.put('/api/workday-slots/:id',
            ...(fetchMiddlewares<RequestHandler>(WorkdaySlotsController)),
            ...(fetchMiddlewares<RequestHandler>(WorkdaySlotsController.prototype.updateWorkdaySlot)),

            async function WorkdaySlotsController_updateWorkdaySlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkdaySlotsController_updateWorkdaySlot, request, response });

                const controller = new WorkdaySlotsController();

              await templateService.apiHandler({
                methodName: 'updateWorkdaySlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsShiftsController_listShifts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/shifts',
            ...(fetchMiddlewares<RequestHandler>(ShiftsController)),
            ...(fetchMiddlewares<RequestHandler>(ShiftsController.prototype.listShifts)),

            async function ShiftsController_listShifts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsShiftsController_listShifts, request, response });

                const controller = new ShiftsController();

              await templateService.apiHandler({
                methodName: 'listShifts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsShiftsController_createShift: Record<string, TsoaRoute.ParameterSchema> = {
                _body: {"in":"body","name":"_body","required":true,"dataType":"any"},
        };
        app.post('/api/shifts',
            ...(fetchMiddlewares<RequestHandler>(ShiftsController)),
            ...(fetchMiddlewares<RequestHandler>(ShiftsController.prototype.createShift)),

            async function ShiftsController_createShift(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsShiftsController_createShift, request, response });

                const controller = new ShiftsController();

              await templateService.apiHandler({
                methodName: 'createShift',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_listUsers: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/users',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.listUsers)),

            async function UsersController_listUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_listUsers, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'listUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_createUser: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateUserRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/users',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.createUser)),

            async function UsersController_createUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_createUser, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'createUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_updateUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateUserRequest"},
        };
        app.put('/api/users/:id',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.updateUser)),

            async function UsersController_updateUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_updateUser, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_deleteUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/users/:id',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.deleteUser)),

            async function UsersController_deleteUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_deleteUser, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecordsController_listRecords: Record<string, TsoaRoute.ParameterSchema> = {
                limit: {"in":"query","name":"limit","dataType":"double"},
                offset: {"in":"query","name":"offset","dataType":"double"},
        };
        app.get('/api/records',
            ...(fetchMiddlewares<RequestHandler>(RecordsController)),
            ...(fetchMiddlewares<RequestHandler>(RecordsController.prototype.listRecords)),

            async function RecordsController_listRecords(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecordsController_listRecords, request, response });

                const controller = new RecordsController();

              await templateService.apiHandler({
                methodName: 'listRecords',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecordsController_createRecord: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateRecordRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/records',
            ...(fetchMiddlewares<RequestHandler>(RecordsController)),
            ...(fetchMiddlewares<RequestHandler>(RecordsController.prototype.createRecord)),

            async function RecordsController_createRecord(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecordsController_createRecord, request, response });

                const controller = new RecordsController();

              await templateService.apiHandler({
                methodName: 'createRecord',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecordsController_updateRecord: Record<string, TsoaRoute.ParameterSchema> = {
                batchNumber: {"in":"path","name":"batchNumber","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateRecordRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/api/records/:batchNumber',
            ...(fetchMiddlewares<RequestHandler>(RecordsController)),
            ...(fetchMiddlewares<RequestHandler>(RecordsController.prototype.updateRecord)),

            async function RecordsController_updateRecord(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecordsController_updateRecord, request, response });

                const controller = new RecordsController();

              await templateService.apiHandler({
                methodName: 'updateRecord',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecordsController_deleteRecord: Record<string, TsoaRoute.ParameterSchema> = {
                batchNumber: {"in":"path","name":"batchNumber","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/api/records/:batchNumber',
            ...(fetchMiddlewares<RequestHandler>(RecordsController)),
            ...(fetchMiddlewares<RequestHandler>(RecordsController.prototype.deleteRecord)),

            async function RecordsController_deleteRecord(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecordsController_deleteRecord, request, response });

                const controller = new RecordsController();

              await templateService.apiHandler({
                methodName: 'deleteRecord',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductsController_listProducts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/products',
            ...(fetchMiddlewares<RequestHandler>(ProductsController)),
            ...(fetchMiddlewares<RequestHandler>(ProductsController.prototype.listProducts)),

            async function ProductsController_listProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductsController_listProducts, request, response });

                const controller = new ProductsController();

              await templateService.apiHandler({
                methodName: 'listProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_listPreparations: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/preparations',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.listPreparations)),

            async function PreparationsController_listPreparations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_listPreparations, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'listPreparations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_getPreparationByMaterial: Record<string, TsoaRoute.ParameterSchema> = {
                materialId: {"in":"path","name":"materialId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/preparations/by-material/:materialId',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.getPreparationByMaterial)),

            async function PreparationsController_getPreparationByMaterial(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_getPreparationByMaterial, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'getPreparationByMaterial',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_getPreparation: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/preparations/:id',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.getPreparation)),

            async function PreparationsController_getPreparation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_getPreparation, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'getPreparation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_createPreparation: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreatePreparationRequest"},
        };
        app.post('/api/preparations',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.createPreparation)),

            async function PreparationsController_createPreparation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_createPreparation, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'createPreparation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_updatePreparation: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdatePreparationRequest"},
        };
        app.put('/api/preparations/:id',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.updatePreparation)),

            async function PreparationsController_updatePreparation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_updatePreparation, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'updatePreparation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_deletePreparation: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/preparations/:id',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.deletePreparation)),

            async function PreparationsController_deletePreparation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_deletePreparation, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'deletePreparation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_listVersions: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/preparations/:id/versions',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.listVersions)),

            async function PreparationsController_listVersions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_listVersions, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'listVersions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_getVersion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                version: {"in":"path","name":"version","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/preparations/:id/versions/:version',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.getVersion)),

            async function PreparationsController_getVersion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_getVersion, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'getVersion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationsController_restoreVersion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                version: {"in":"path","name":"version","required":true,"dataType":"string"},
        };
        app.post('/api/preparations/:id/restore/:version',
            ...(fetchMiddlewares<RequestHandler>(PreparationsController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationsController.prototype.restoreVersion)),

            async function PreparationsController_restoreVersion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationsController_restoreVersion, request, response });

                const controller = new PreparationsController();

              await templateService.apiHandler({
                methodName: 'restoreVersion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsIngredientsController_listIngredients: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/ingredients',
            ...(fetchMiddlewares<RequestHandler>(IngredientsController)),
            ...(fetchMiddlewares<RequestHandler>(IngredientsController.prototype.listIngredients)),

            async function IngredientsController_listIngredients(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientsController_listIngredients, request, response });

                const controller = new IngredientsController();

              await templateService.apiHandler({
                methodName: 'listIngredients',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsIngredientsController_createIngredient: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateIngredientRequest"},
        };
        app.post('/api/ingredients',
            ...(fetchMiddlewares<RequestHandler>(IngredientsController)),
            ...(fetchMiddlewares<RequestHandler>(IngredientsController.prototype.createIngredient)),

            async function IngredientsController_createIngredient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientsController_createIngredient, request, response });

                const controller = new IngredientsController();

              await templateService.apiHandler({
                methodName: 'createIngredient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsIngredientsController_updateIngredient: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateIngredientRequest"},
        };
        app.put('/api/ingredients/:id',
            ...(fetchMiddlewares<RequestHandler>(IngredientsController)),
            ...(fetchMiddlewares<RequestHandler>(IngredientsController.prototype.updateIngredient)),

            async function IngredientsController_updateIngredient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientsController_updateIngredient, request, response });

                const controller = new IngredientsController();

              await templateService.apiHandler({
                methodName: 'updateIngredient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsIngredientsController_deleteIngredient: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/ingredients/:id',
            ...(fetchMiddlewares<RequestHandler>(IngredientsController)),
            ...(fetchMiddlewares<RequestHandler>(IngredientsController.prototype.deleteIngredient)),

            async function IngredientsController_deleteIngredient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsIngredientsController_deleteIngredient, request, response });

                const controller = new IngredientsController();

              await templateService.apiHandler({
                methodName: 'deleteIngredient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMaterialsController_listMaterials: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/materials',
            ...(fetchMiddlewares<RequestHandler>(MaterialsController)),
            ...(fetchMiddlewares<RequestHandler>(MaterialsController.prototype.listMaterials)),

            async function MaterialsController_listMaterials(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMaterialsController_listMaterials, request, response });

                const controller = new MaterialsController();

              await templateService.apiHandler({
                methodName: 'listMaterials',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMaterialsController_createMaterial: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateMaterialRequest"},
        };
        app.post('/api/materials',
            ...(fetchMiddlewares<RequestHandler>(MaterialsController)),
            ...(fetchMiddlewares<RequestHandler>(MaterialsController.prototype.createMaterial)),

            async function MaterialsController_createMaterial(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMaterialsController_createMaterial, request, response });

                const controller = new MaterialsController();

              await templateService.apiHandler({
                methodName: 'createMaterial',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMaterialsController_updateMaterial: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateMaterialRequest"},
        };
        app.put('/api/materials/:id',
            ...(fetchMiddlewares<RequestHandler>(MaterialsController)),
            ...(fetchMiddlewares<RequestHandler>(MaterialsController.prototype.updateMaterial)),

            async function MaterialsController_updateMaterial(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMaterialsController_updateMaterial, request, response });

                const controller = new MaterialsController();

              await templateService.apiHandler({
                methodName: 'updateMaterial',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMaterialsController_deleteMaterial: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/materials/:id',
            ...(fetchMiddlewares<RequestHandler>(MaterialsController)),
            ...(fetchMiddlewares<RequestHandler>(MaterialsController.prototype.deleteMaterial)),

            async function MaterialsController_deleteMaterial(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMaterialsController_deleteMaterial, request, response });

                const controller = new MaterialsController();

              await templateService.apiHandler({
                methodName: 'deleteMaterial',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMachinesController_listMachines: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/machines',
            ...(fetchMiddlewares<RequestHandler>(MachinesController)),
            ...(fetchMiddlewares<RequestHandler>(MachinesController.prototype.listMachines)),

            async function MachinesController_listMachines(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMachinesController_listMachines, request, response });

                const controller = new MachinesController();

              await templateService.apiHandler({
                methodName: 'listMachines',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughTypesController_listDoughTypes: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/dough-types',
            ...(fetchMiddlewares<RequestHandler>(DoughTypesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughTypesController.prototype.listDoughTypes)),

            async function DoughTypesController_listDoughTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughTypesController_listDoughTypes, request, response });

                const controller = new DoughTypesController();

              await templateService.apiHandler({
                methodName: 'listDoughTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPreparationTypesController_listPreparationTypes: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/preparations-types',
            ...(fetchMiddlewares<RequestHandler>(PreparationTypesController)),
            ...(fetchMiddlewares<RequestHandler>(PreparationTypesController.prototype.listPreparationTypes)),

            async function PreparationTypesController_listPreparationTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPreparationTypesController_listPreparationTypes, request, response });

                const controller = new PreparationTypesController();

              await templateService.apiHandler({
                methodName: 'listPreparationTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_listDoughRecipes: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/dough',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.listDoughRecipes)),

            async function DoughRecipesController_listDoughRecipes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_listDoughRecipes, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'listDoughRecipes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_getDoughRecipeByMaterial: Record<string, TsoaRoute.ParameterSchema> = {
                materialId: {"in":"path","name":"materialId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/dough/by-material/:materialId',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.getDoughRecipeByMaterial)),

            async function DoughRecipesController_getDoughRecipeByMaterial(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_getDoughRecipeByMaterial, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'getDoughRecipeByMaterial',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_getDoughRecipe: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/dough/:id',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.getDoughRecipe)),

            async function DoughRecipesController_getDoughRecipe(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_getDoughRecipe, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'getDoughRecipe',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_createDoughRecipe: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateDoughRecipeRequest"},
        };
        app.post('/api/dough',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.createDoughRecipe)),

            async function DoughRecipesController_createDoughRecipe(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_createDoughRecipe, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'createDoughRecipe',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_updateDoughRecipe: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateDoughRecipeRequest"},
        };
        app.put('/api/dough/:id',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.updateDoughRecipe)),

            async function DoughRecipesController_updateDoughRecipe(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_updateDoughRecipe, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'updateDoughRecipe',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_deleteDoughRecipe: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/dough/:id',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.deleteDoughRecipe)),

            async function DoughRecipesController_deleteDoughRecipe(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_deleteDoughRecipe, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'deleteDoughRecipe',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_listVersions: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/dough/:id/versions',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.listVersions)),

            async function DoughRecipesController_listVersions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_listVersions, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'listVersions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_getVersion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                versionNumber: {"in":"path","name":"versionNumber","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/dough/:id/versions/:versionNumber',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.getVersion)),

            async function DoughRecipesController_getVersion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_getVersion, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'getVersion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDoughRecipesController_restoreVersion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                versionNumber: {"in":"path","name":"versionNumber","required":true,"dataType":"string"},
        };
        app.post('/api/dough/:id/restore/:versionNumber',
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController)),
            ...(fetchMiddlewares<RequestHandler>(DoughRecipesController.prototype.restoreVersion)),

            async function DoughRecipesController_restoreVersion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDoughRecipesController_restoreVersion, request, response });

                const controller = new DoughRecipesController();

              await templateService.apiHandler({
                methodName: 'restoreVersion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCsrfController_getCsrfToken: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/csrf-token',
            ...(fetchMiddlewares<RequestHandler>(CsrfController)),
            ...(fetchMiddlewares<RequestHandler>(CsrfController.prototype.getCsrfToken)),

            async function CsrfController_getCsrfToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCsrfController_getCsrfToken, request, response });

                const controller = new CsrfController();

              await templateService.apiHandler({
                methodName: 'getCsrfToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LoginRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/auth/logout',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_me: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/auth/me',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.me)),

            async function AuthController_me(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_me, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'me',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_updateProfile: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"UpdateProfileRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/api/auth/profile',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.updateProfile)),

            async function AuthController_updateProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_updateProfile, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'updateProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
