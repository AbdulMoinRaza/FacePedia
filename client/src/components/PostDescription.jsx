import React from "react";
import { Link } from "react-router-dom";

/**
 * Renders a post description with tags dynamically replaced by hyperlinks.
 * 
 * @param {Object} props 
 * @param {String} props.description - The description text of the post.
 * @param {Array} props.tags - The list of tagged users, each containing `userId` and `name`.
 */
const RenderPostDescription = ({ description, tags }) => {
    const renderDescription = () => {
        const parts = [];
        let lastIndex = 0;
    
        tags.forEach((tag) => {
          const tagIndex = description.indexOf(`@${tag.name}`, lastIndex);
          if (tagIndex !== -1) {
            // Add text before the tag
            if (tagIndex > lastIndex) {
              parts.push(description.slice(lastIndex, tagIndex));
            }
    
            // Add the tag as a hyperlink
            parts.push(
<Link
  key={tag.userId}
  to={`/profile/${tag.userId}`}
  style={{
    color: "#40a7c6", // A pleasant blue shade
    textDecoration: "none", // No underline by default
    fontWeight: "500", // Slightly bold
    transition: "color 0.3s ease-in-out", // Smooth color transition
  }}
  onMouseEnter={(e) => {
    e.target.style.color = "#0056b3"; // Darker blue on hover
    e.target.style.textDecoration = "underline"; // Add underline on hover
  }}
  onMouseLeave={(e) => {
    e.target.style.color = "#40a7c6"; // Restore default blue
    e.target.style.textDecoration = "none"; // Remove underline
  }}
>
  @{tag.name}
</Link>

            );
    
            // Update the last index
            lastIndex = tagIndex + tag.name.length + 1; // 1 for the "@"
          }
        });
    
        // Add remaining text
        if (lastIndex < description.length) {
          parts.push(description.slice(lastIndex));
        }
    
        return parts;
      };
    
      return <div>{renderDescription()}</div>;
    };

export default RenderPostDescription;
