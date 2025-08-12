import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DashboardJobCard from "./DashboardJobCard";

const JobBoard = ({ columns, stageMapping, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="job-board">
        {Object.entries(columns).map(([stage, jobs], index) => (
          <div key={stage} className="job-column">
            <h3 className="job-column-title">{stageMapping[stage]}</h3>
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`job-droppable ${snapshot.isDraggingOver ? "is-dragging-over" : ""}`}
                >
                  {jobs.length === 0 && (
                    <p className="job-empty">No applications</p>
                  )}
                  {jobs.map((job, idx) => (
                    <Draggable key={job.id} draggableId={job.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`job-draggable ${snapshot.isDragging ? "is-dragging" : ""}`}
                          style={provided.draggableProps.style}
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
