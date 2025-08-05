import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DashboardJobCard from "./DashboardJobCard";

const JobBoard = ({ columns, stageMapping, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          overflowX: "auto",
          paddingBottom: 10,
        }}
      >
        {Object.entries(columns).map(([stage, jobs], index) => (
          <div
            key={stage}
            style={{
              flex: "1 1 0",
              backgroundColor: "#fafafa",
              padding: 12,
              borderRadius: 8,
              minHeight: 350,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              maxWidth: 320,
              overflowY: "auto",
              transition: "background-color 0.2s ease",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontSize: "1.1rem",
                marginBottom: 12,
                color: "#333",
                fontWeight: "600",
                userSelect: "none",
              }}
            >
              {stageMapping[stage]} {/* column name */}
            </h3>
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    backgroundColor: snapshot.isDraggingOver
                      ? "#e0f7fa"
                      : "#fafafa",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    overflowY: "auto",
                    paddingRight: 4,
                    minHeight: 300,
                  }}
                >
                  {jobs.length === 0 && (
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#777",
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      No applications
                    </p>
                  )}
                  {jobs.map((job, idx) => (
                    <Draggable key={job.id} draggableId={job.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            userSelect: "none",
                            backgroundColor: snapshot.isDragging
                              ? "#bbdefb"
                              : "white",
                            borderRadius: 8,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          <DashboardJobCard job={job} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default JobBoard;
