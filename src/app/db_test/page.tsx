"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DbTest() {
  const tasks = useQuery(api.tasks.get);

  return <div>{JSON.stringify(tasks)}</div>;
}
