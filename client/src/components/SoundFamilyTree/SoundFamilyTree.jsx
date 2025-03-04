import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import * as d3 from "d3";
import "./SoundFamilyTree.css";
import soundService from "../../services/file-upload.service";

const SoundFamilyTree = ({ originalProject, relatedProjects }) => {
  const svgRef = useRef(null);
  const [masterSound, setMasterSound] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Use navigate instead of window.location

  // Fetch the original master sound to use as the true root
  useEffect(() => {
    if (!originalProject || !originalProject.masterSoundId) return;

    setIsLoading(true);
    soundService
      .getSound(originalProject.masterSoundId)
      .then((sound) => {
        setMasterSound(sound);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching master sound:", error);
        setIsLoading(false);
      });
  }, [originalProject]);

  useEffect(() => {
    if (isLoading || !masterSound || !originalProject || !relatedProjects)
      return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Prepare data for visualization with master sound as the true root
    const treeData = {
      id: masterSound._id,
      name: masterSound.title,
      creator: masterSound.creator?.name,
      type: "sound", // Mark as sound to style differently
      children: [
        {
          id: originalProject._id,
          name: originalProject.title,
          creator: originalProject.creator?.name,
          count: originalProject.soundId?.length || 0,
          type: "project",
          children: relatedProjects.map((project) => ({
            id: project._id,
            name: project.title,
            creator: project.creator?.name,
            count: project.soundId?.length || 0,
            type: "project",
          })),
        },
      ],
    };

    // Set up dimensions - increase width for better spacing
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 150, bottom: 40, left: 150 };

    // Create SVG with container dimensions
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create tree layout - horizontal layout
    const treeLayout = d3
      .tree()
      .size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2)); // Increase spacing between nodes

    // Convert data to hierarchy
    const root = d3.hierarchy(treeData);

    // Position nodes
    const treeData2 = treeLayout(root);
    const nodes = treeData2.descendants();
    const links = treeData2.links();

    // Create container for all elements with the transform
    const container = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create links
    container
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        return `M${d.source.y},${d.source.x}
                C${(d.source.y + d.target.y) / 2},${d.source.x}
                 ${(d.source.y + d.target.y) / 2},${d.target.x}
                 ${d.target.y},${d.target.x}`;
      });

    // Create node groups
    const node = container
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr(
        "class", 
        (d) => `node ${d.data.type === "sound" ? "node--sound" : "node--project"}`
      )
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer"); // Add cursor pointer directly

    // Create transparent hit area for better clicking (larger than the visible circle)
    node
      .append("circle")
      .attr("class", "hit-area")
      .attr("r", 20)
      .style("fill", "transparent")
      .on("click", (event, d) => {
        event.stopPropagation(); // Stop event propagation
        // Use navigate instead of window.location for smoother transitions
        if (d.data.type === "sound") {
          navigate(`/sounds/${d.data.id}`);
        } else {
          navigate(`/projects/${d.data.id}`);
        }
      });

    // Add visible circles to nodes - now smaller than hit area for easier interaction
    node
      .append("circle")
      .attr("class", "visible-circle")
      .attr("r", d => d.data.type === "sound" ? 12 : 8)
      .attr("fill", (d) => {
        if (d.data.type === "sound") return "#e74c3c"; // Red for sound
        return d.depth === 1 ? "#f9cb43" : "#fba518"; // Yellow shades for projects
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    // Add icons or symbols to distinguish types
    node
      .append("text")
      .attr("class", "node-icon")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", d => d.data.type === "sound" ? "14px" : "10px")
      .style("font-weight", "bold")
      .text(d => d.data.type === "sound" ? "♪" : "P");

    // Add labels
    node
      .append("text")
      .attr("class", "node-label")
      .attr("dy", ".35em")
      .attr("x", (d) => (d.children ? -15 : 15))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => {
        if (d.data.type === "sound") {
          return `${d.data.name} (Original)`;
        }
        return `${d.data.name} (${d.data.count})`;
      });

    // Add creator name below
    node
      .append("text")
      .attr("class", "node-creator")
      .attr("dy", "1.75em")
      .attr("x", (d) => (d.children ? -15 : 15))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .style("font-size", "0.8em")
      .style("opacity", 0.8) // Make creator name slightly less prominent
      .text((d) => `by ${d.data.creator}`);

  }, [isLoading, masterSound, originalProject, relatedProjects, navigate]);

 // Show loading state
 if (isLoading) {
    return (
      <div className="sound-family-tree">
        <h3>Sound Family Tree</h3>
        <div className="loading-message">Loading family tree...</div>
      </div>
    );
  }

  // Handle case where master sound couldn't be loaded
  if (!masterSound && !isLoading) {
    return (
      <div className="sound-family-tree">
        <h3>Sound Family Tree</h3>
        <div className="error-message">
          Could not load the original sound information
        </div>
      </div>
    );
  }

  return (
    <div className="sound-family-tree">
      <h3>Sound Family Tree</h3>
      <div className="tree-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default SoundFamilyTree;
