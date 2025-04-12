"use client";

import { useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMindMapStore } from "@/store/mindmap-store";
import dagre from "dagre";

// Dagre layout settings
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export function MindMap() {
  // Get nodes/edges from Zustand store
  const storeNodes = useMindMapStore((state) => state.nodes);
  const storeEdges = useMindMapStore((state) => state.edges);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // When store data changes, layout and update the flow
    if (storeNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(
          storeNodes,
          storeEdges,
          "TB" // Layout direction: Top-to-Bottom
        );
      setNodes([...layoutedNodes]);
      // Add markerEnd for arrows
      setEdges([
        ...layoutedEdges.map((edge) => ({
          ...edge,
          markerEnd: { type: MarkerType.ArrowClosed },
        })),
      ]);
    } else {
      // Clear the flow if store is empty
      setNodes([]);
      setEdges([]);
    }
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const onConnect = (params: Connection | Edge) =>
    setEdges((eds) => addEdge(params, eds));

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-inner relative">
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-gray-500 text-center p-4">
          Enter a Twitter profile URL above and click Analyze to generate the
          mind map.
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-transparent"
        proOptions={{ hideAttribution: true }} // Hide React Flow attribution for cleaner look
        nodesDraggable={nodes.length > 0} // Allow dragging only when nodes exist
        nodesConnectable={false} // Disable manual connection for this view
        elementsSelectable={nodes.length > 0}
      >
        <Background color="#4b5563" gap={16} />
        <Controls
          className="react-flow__controls-override"
          showInteractive={false}
        />
      </ReactFlow>
      <style jsx global>{`
        .react-flow__controls-override button {
          background-color: #374151; // bg-gray-700
          border-bottom-color: #4b5563; // border-gray-600
        }
        .react-flow__controls-override button:hover {
          background-color: #4b5563; // bg-gray-600
        }
        .react-flow__controls-override button svg {
          fill: #d1d5db; // fill-gray-300
        }
      `}</style>
    </div>
  );
}
