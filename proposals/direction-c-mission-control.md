# Direction C - Mission Control

Ambition: rebuild the IA around operations. The home surface is a live
fleet dashboard, and the thread inspector is rebuilt as a trace timeline
of observability-tool grade (think Datadog APM / LangSmith / Jaeger, but
native to this product's dual-side agent model).

## Thesis

Directions A and B optimize for building agents. Mission Control bets that
the long-run daily user is the person operating them: watching production
threads, catching failures, understanding cost, and intervening. Today's
spec treats that person as an afterthought: threads are a paginated table,
and understanding one run means mentally joining three tabs (Messages,
Logs, Cost) with no shared time axis. If agents run unattended for real
work, observability is not a tab - it is the product.

## Layout 1: Home (fleet dashboard)

```
+--------+--------------------------------------------------------------+
|        |  Mission Control                       today v   [+ Thread] |
| Side   |  +----------+ +----------+ +----------+ +-----------------+ |
| bar    |  | RUNNING  | | DONE 24h | | ERRORS   | | SPEND today     | |
|        |  |    4     | |   132    | |  3  !    | | $1.84  ####--   | |
|        |  +----------+ +----------+ +----------+ +-----------------+ |
|        |                                                              |
|        |  LIVE                                    per-agent [chips]   |
|        |  o 3f9a1c fraud_review    side_b thinking   14 msg  $0.002  |
|        |  o 8c02dd order_support   tool:refund_check  6 msg  $0.001  |
|        |  o 540aea inventory_chk   waiting human      2 msg  $0.000  |
|        |                                                              |
|        |  NEEDS ATTENTION                                             |
|        |  ! 5b7d70 fraud_review    errored: tool timeout   [revive]  |
|        |  ! 91ab2e order_support   paused 2h: awaiting input [open]  |
|        |                                                              |
|        |  RECENT                                  [all threads ->]    |
|        |  . 7712fa inventory_chk   done  9 msg  $0.0006  2h ago      |
+--------+--------------------------------------------------------------+
```

- Fed entirely by the existing `/api/events` registry socket plus one
  aggregate query; live rows animate state transitions.
- "Needs attention" is a first-class concept: errored, paused-waiting,
  stuck (no frames for N minutes while RUNNING). Each row carries its
  one-click remedy (revive / open / stop), using existing endpoints.
- Per-agent chips filter everything in place; time-range picker top right.

## Layout 2: Thread as trace timeline (the centerpiece)

Replaces the six-tab inspector with a single time-axis view. Every event a
thread produces (message, tool call, hook, log line, cost tick, state
change) is one span on a shared timeline, lanes per actor:

```
+--------------------------------------------------------------------------+
| <- fraud_review / 3f9a1c   o RUNNING  14 msg  $0.0021  [pause] [stop v] |
+--------------------------------------------------------------------------+
| lanes        0s ---- 2s ---- 4s ---- 6s ---- 8s ---- 10s --- now        |
| side_a       [ msg 1 ]      [ msg 3      ]           [ msg 5..stream ]  |
| side_b            [ msg 2 ]          [ msg 4 ]                          |
| tools              [lookup_account]      [risk_score]                   |
| hooks         [pre]                 [post]                              |
| logs         | | |   |            ||  |                    |            |
| cost         ....1.2k tok..........2.9k tok..............4.1k tok       |
+-----------------------------+--------------------------------------------+
| filter: [messages][tools][logs][hooks]  | DETAIL: risk_score (tool)      |
|                                          | dur 1.42s   in: {...}          |
| (click any span -> detail pane;          | out: {"score":0.87}  [copy]   |
|  click log tick -> log context)          | produced by: side_a msg 3      |
+-----------------------------+--------------------------------------------+
```

- One shared time axis kills the tab-joining problem: you see that the
  error log tick sits inside the `risk_score` span which delayed side_b's
  reply, without reconstructing it mentally.
- Live threads: the timeline grows at the right edge with a follow toggle;
  streaming text renders inside the active message span (chat bubbles are
  available as an alternate "conversation" lens for reading long text).
- Terminated threads: pure REST render of the same component.
- Spans link back to composition: "produced by" opens the agent node
  (canvas in direction B, or `/agents/:id` here).
- Powered by existing endpoints only: messages + logs + cost merged on
  timestamps client-side; no backend change required to ship v1. A later
  `/api/threads/:id/trace` endpoint that pre-merges would be a nice
  optimization, not a dependency.

## Information architecture

- Home = Mission Control dashboard. Sidebar order flips: Threads, Agents,
  then catalog (Prompts, Models, Tools), then Marketplace/Settings.
- Build surfaces (composition canvas, catalog CRUD) reuse the current spec
  unchanged; direction A's panels/palette/cache are included as the
  interaction foundation.
- Cost gets a real surface: spend by agent/model/day with drill-down to
  the exact threads behind a number (the contract's cost endpoints
  finally earn their keep).

## What is kept

- Everything from the current spec except ThreadsView and
  ThreadInspectorView; composition canvas untouched.

## What is replaced

- ThreadsView table -> fleet dashboard (a denser "all threads" table
  remains one click away for audit/search).
- Tabbed thread inspector -> trace timeline + detail pane (Files and
  KV Store become detail-pane sections; raw tabs remain reachable via a
  "legacy view" toggle during transition).

## New infrastructure required

- **Timeline engine.** One virtualized SVG/canvas lane renderer
  (~the complexity of CanvasEdges; owned code, same pattern as ADR-005).
- **Event merge layer.** Normalizes messages/logs/cost into one ordered
  span stream, batched at 30fps for live threads.
- **Aggregate queries.** Client-side rollups for the dashboard counters;
  cheap at current scale, replaceable by a backend aggregate later.

## Risks

- Medium. The timeline is a genuinely new component with real edge cases
  (clock skew between log and message timestamps, overlapping spans,
  very long threads). Mitigations: virtualization from day one, span
  clamping rules in the spec, and the conversation lens as a fallback
  reading mode.
- If most usage turns out to be build-time not run-time, this optimizes
  the wrong loop; check thread volume before committing.

## Choose this when

Agents run real production workloads and "what is my fleet doing right
now, and why did that run go wrong" is the daily question. Pairs
naturally with direction B later (B builds, C observes; A is the shared
foundation of both).
