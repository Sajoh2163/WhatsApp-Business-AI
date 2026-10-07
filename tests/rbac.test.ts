import test from "node:test"; import assert from "node:assert/strict";
import { can, requirePermission } from "../src/lib/rbac.ts";
test("owner a tout, agent seulement les conversations", () => {
  assert.ok(can("owner", "billing:write")); assert.ok(!can("admin", "billing:write"));
  assert.ok(can("agent", "conversations:write")); assert.ok(!can("agent", "catalog:write"));
  assert.throws(() => requirePermission("agent", "team:write"), /FORBIDDEN/);
});
