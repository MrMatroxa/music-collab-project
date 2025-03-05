import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./SoundFamilyTree.css";
import { useNavigate } from "react-router-dom"; // Import the navigation hook

const SoundFamilyTree = ({ originalProject, relatedProjects }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    // Return early if no projects to display
    if (!originalProject || !relatedProjects || relatedProjects.length === 0) {
      return;
    }

    function buildHierarchy() {
      // Start with a map of all projects by ID
      const projectsMap = new Map();
      
      // Add the original project
      projectsMap.set(originalProject._id, {
        ...originalProject,
        children: [],
        isCurrentProject: true // Mark the current project for highlighting
      });

      // Add all related projects to the map
      relatedProjects.forEach(project => {
        projectsMap.set(project._id, {
          ...project,
          children: [],
          isCurrentProject: false
        });
      });

      // Connect projects based on parent-child relationships
      const allProjects = [originalProject, ...relatedProjects];
      allProjects.forEach(project => {
        if (project.parentProjectId && projectsMap.has(project.parentProjectId)) {
          const parent = projectsMap.get(project.parentProjectId);
          parent.children.push(projectsMap.get(project._id));
        }
      });
      
      // Find the root project (the one with no parent)
      let rootProject = originalProject;
      for (const project of allProjects) {
        if (!project.parentProjectId) {
          rootProject = project;
          break;
        }
      }
      
      // If we couldn't find a clear root, use the original project
      return projectsMap.get(rootProject._id);
    }

    // Build the hierarchical data
    const hierarchyData = buildHierarchy();

    // Set up the SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 40, right: 90, bottom: 50, left: 90 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create the tree layout
    const treeLayout = d3.tree().size([width, height]);
    
    // Convert the data to a d3 hierarchy
    const root = d3.hierarchy(hierarchyData);
    
    // Assign x,y positions to nodes
    treeLayout(root);

    // Create a group for the tree
    const g = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add links between nodes
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y) // Swap x and y for horizontal layout
        .y(d => d.x))
      .attr("fill", "none")
      .attr("stroke", "#FFB800")
      .attr("stroke-width", 2);

    // Create node groups
    const nodes = g
      .selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", d => {
        const classes = [`node ${d.data.isFork ? "fork" : "original"}`];
        if (d.data._id === originalProject._id) classes.push("current-project");
        return classes.join(" ");
      })
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer") // Add pointer cursor to show clickability
      .on("click", (event, d) => {
        // Navigate to the clicked project (if it's not the current one)
        if (d.data._id !== originalProject._id) {
          navigate(`/projects/${d.data._id}`);
        }
      });

    // Add circles for nodes
    nodes
      .append("circle")
      .attr("r", d => d.data._id === originalProject._id ? 12 : 10)
      .style("fill", d => {
        if (d.data._id === originalProject._id) return "#FF5722"; // Highlight current project
        return d.data.isFork ? "#FFB800" : "#424242";
      })
      .style("stroke", d => d.data._id === originalProject._id ? "#FF3D00" : "#333333")
      .style("stroke-width", d => d.data._id === originalProject._id ? 3 : 2);

    // Add labels for nodes
    nodes
      .append("text")
      .attr("dy", ".31em")
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.title ? 
        (d.data.title.length > 20 ? d.data.title.substring(0, 17) + "..." : d.data.title) 
        : "Untitled")
      .style("font-size", "12px")
      .style("font-weight", d => d.data._id === originalProject._id ? "bold" : "normal")
      .style("fill", d => d.data._id === originalProject._id ? "#000" : "#333");

    // Add creator name
    nodes
      .append("text")
      .attr("dy", "1.2em")
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.creator && d.data.creator.name ? `by ${d.data.creator.name}` : "")
      .style("font-size", "10px")
      .style("fill", "#666");

    // Add "You are here" indicator for current project
    nodes
      .filter(d => d.data._id === originalProject._id)
      .append("text")
      .attr("dy", "2.4em")
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text("You are here")
      .style("font-size", "9px")
      .style("fill", "#FF5722")
      .style("font-weight", "bold");

    // Add tooltip
    nodes.append("title")
      .text(d => {
        const date = new Date(d.data.createdAt).toLocaleDateString();
        let tooltipText = `${d.data.title}\nCreated: ${date}\n${d.data.isFork ? "Forked project" : "Original project"}`;
        if (d.data._id === originalProject._id) tooltipText += "\n(Current project)";
        return tooltipText;
      });

  }, [originalProject, relatedProjects, dimensions, navigate]); // Add navigate to dependency array

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(500, container.clientWidth * 0.5)
        });
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial sizing
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="sound-family-tree">
      <h3>Project Family Tree</h3>
      <div className="tree-container">
        <svg ref={svgRef}></svg>
      </div>
      {(!originalProject || !relatedProjects || relatedProjects.length === 0) && (
        <div className="no-data-message">
          No project family tree data available.
        </div>
      )}
    </div>
  );
};

export default SoundFamilyTree;