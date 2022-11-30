import { renderToString } from "react-dom/server";

export function table (doc, headingsRaw, data, pageMargin, liveArea, padding, startX, finalLine = false) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold')
    const headings = headingsRaw.filter ( column => column.pdf == true );
    const xPositions = [];
    setXPosition(headings, pageMargin, xPositions)
    getHeaders(doc, headings, pageMargin, liveArea, xPositions, startX);
    doc.setFont(undefined, 'normal')
    let finalYposition = getBody(doc, headings, data, pageMargin, liveArea, xPositions, padding, startX, finalLine);
    return finalYposition;

}

export function center (doc, text, yPosition) {
    doc.text(text, (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text) * doc.internal.getFontSize() / 2), yPosition);
} 

export function countLinesTextArea (data) {
    let counter = 1
    
    if(data != null) {

        let lines = (data.split("\n")).length;  
        counter = lines;

        for(let i = 0; i < (data.length); i++) {
            
            if(i == (73 * counter)) {
                counter++;
            }
        }
    }
    if(counter > 1) {
        return counter     
    }
    return counter + 1 
    
}

export function createHeaderPage (doc, image, imageExtension, pageMargin, primaryText, secondaryText, callBackContent, callBackFooter, isFirstPage = false) {
    const height = (image.height * 100) / image.width;
    !isFirstPage ? doc.addPage() : null;
    doc.addImage(image, imageExtension,595 - pageMargin - (height * 2), pageMargin -12, 100, height);
    doc.addImage(meraLogo, 'png',  pageMargin , pageMargin + 2, 100, 10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold')
    doc.setFontSize(14);
    center(doc, primaryText, pageMargin + 20);
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10);
    center(doc, secondaryText, pageMargin + 35);
    callBackContent();
    callBackFooter();

}

export function createFooterPage (doc, pageMargin,primaryText,secondaryText,otherText) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(primaryText,pageMargin, 842 - pageMargin);
    doc.text(secondaryText,pageMargin , 842 - pageMargin+ 18);
    doc.text(otherText,pageMargin , 842 - pageMargin+ 36);
    let numberPage = doc.internal.getNumberOfPages()
    doc.text(renderToString(numberPage), pageMargin + 480, 842 - pageMargin+ 36);
    doc.setLineWidth(1);
    doc.line(pageMargin - 10, 842 - pageMargin+ 45, 595 - pageMargin + 10, 842 - pageMargin+ 45);

}

function setXPosition(headings, pageMargin, xPositions) {
    headings.forEach((heading, index) => {
        // get x position for heading
        let xHeaderPosition = 0;
        
        switch (index) {
            case 0:
                xHeaderPosition = pageMargin + 3
                break;
            case headings.lenght-1:
                xHeaderPosition = xPositions[index-1] + headings[index-1].pdfWidth - 3
                break;
            default:
                xHeaderPosition = xPositions[index-1] + headings[index-1].pdfWidth
                break;
        }

        xPositions.push(xHeaderPosition)
    })
}

export function getTextWith(doc, text) {
    return parseInt(doc.getStringUnitWidth(text) * doc.internal.getFontSize())
}

function getHeaders(doc, headings, pageMargin, liveArea, xPositions, startX = 0) {
    const finalMargin = startX + pageMargin;
    doc.line(pageMargin, finalMargin, liveArea.width, finalMargin)

    headings.forEach((heading, index) => {
        // If you decide to add xPos to the header mappings this will fire
        if (heading.hasOwnProperty('xPos')) {
            doc.text(String(heading.name), heading.xPos, finalMargin)
            xPositions.push(heading.xPos)
        } else {
            // get x position for heading
            const xHeaderPosition = xPositions[index]

            // need to position our text within our live area 
            const yPositionForHeaders = finalMargin + 13;

            let finalXHeaderPosition = xHeaderPosition;

            switch (heading.pdfAlign) {
                case 'right':
                    finalXHeaderPosition = index < xPositions.length-1 ? xPositions[index+1] - 9 : liveArea.width - 4 //xHeaderPosition + txtWidth + heading.pdfWidth;
                    break;
                case 'center':
                    const columnWidth = index < xPositions.length-1 ? xPositions[index+1] - xPositions[index] : liveArea.width - xPositions[index]
                    finalXHeaderPosition = xPositions[index] + (columnWidth / 2)
                    break
                default:
                    finalXHeaderPosition = xHeaderPosition + 1;
                    break;
            }

            const options = {align: heading.pdfAlign}
            doc.text(String(heading.name), finalXHeaderPosition, yPositionForHeaders,options)
        }
    })

    doc.line(pageMargin, finalMargin + 18.5, liveArea.width , finalMargin + 18.5)
}

function getBody(doc, headings, data, pageMargin, liveArea, xPositions, padding, startX = 0, finalLine = false) {
    const baseYPosForRows = pageMargin + padding + 20 + startX;
    let nextYPos = baseYPosForRows + 5;
    if(data.length == 0){
        const noRecordMessage = ("Sin información");
        // split text row with self width 
        const textMessage = doc.splitTextToSize(noRecordMessage.toString(), liveArea.width / 2);
            
        //doc.text(longText, finalXHeaderPosition, nextYPos)
        const options = {align:'center'};
        doc.text((liveArea.width / 2) + padding + 20, nextYPos, textMessage, options);
        nextYPos += 30;
    }
    data.forEach((row, rIndex) => {
        // Here we are going to collect all columns potential max heights (below)
        // Before we determine the nextYPosition we have to grab the tallest value
        // and add that to the previous height.
        const rowHeights = []
        
        // COLUMNS
        headings.forEach((column, colIndex) => {
            // Using the .splitTextToSize method will take a 
            // string and a width parameter. It will return an array of strings. 
            const longText = doc.splitTextToSize(String(row[column.raw]), xPositions[colIndex] - xPositions[colIndex !== 0 && colIndex - 1] )
            
            // To get row height, we will use the .getLineHeight method
            // This method returns a line height based on set text 
            // size for the document. Multiplied by the array length, your
            // value should be at minimum a standard line of text, OR at
            // maximum the amount of lines of text by line height

            let rowHeight = (longText.length * 2) * doc.getLineHeight()
            if(column.pdfWidth > 399) {
                rowHeight = (longText.length / 4) * doc.getLineHeight()   
            }
            else if(longText.length > 4) {
                rowHeight = (longText.length / 1.7) * doc.getLineHeight()
            } 
            

            rowHeights.push(rowHeight)
            //countLinesTextArea()

            let finalXHeaderPosition = xPositions[colIndex]
            switch (column.pdfAlign) {
                case 'right':
                    finalXHeaderPosition = colIndex < xPositions.length-1 ? xPositions[colIndex+1] - 9 : liveArea.width - 4//+ column.pdfWidth;
                    break;
                case 'center':
                    const columnWidth = colIndex < xPositions.length-1 ? xPositions[colIndex+1] - xPositions[colIndex] : liveArea.width - xPositions[colIndex]
                    finalXHeaderPosition = xPositions[colIndex] + (columnWidth / 2)
                    break
                default:
                    finalXHeaderPosition = xPositions[colIndex] + 2
                    break;
            }
            // Column styles go here (lines, images, shapes)

            // split text row with self width 
            const textline = doc.splitTextToSize(longText.toString(), column.pdfWidth);
      
            //doc.text(longText, finalXHeaderPosition, nextYPos)
            const options = {align:column.pdfAlign};
            doc.text(finalXHeaderPosition, nextYPos, textline, options);
        })
        if (finalLine == true && rIndex == data.length-1) doc.line(pageMargin, nextYPos-padding, liveArea.width, nextYPos-padding)

        // Here's the accumulator expression to inform the next row start point
        nextYPos = nextYPos + padding + Math.max(...rowHeights, 1)
        
        // When generating looped data, you may need to add pages manually.
        // The good thing is that we've defined our live area boundaries,
        // and can add a new page when our yPosition exceeds them. We need
        // to take some care to reset the yPosition because if you don't:
        // the yPosition will persist to the next page, and more than likely
        // disappear from view as your yPosition grows.
        if (nextYPos > (liveArea.height - 38)) {
            doc.addPage()
            nextYPos = pageMargin + padding + 20;

            doc.setFont(undefined, 'bold')
            getHeaders(doc, headings, pageMargin, liveArea, xPositions);
            doc.setFont(undefined, 'normal')
            doc.setLineWidth(2);
            doc.roundedRect(pageMargin - 10, 10, 595 - (pageMargin * 2 ) + 20, 842 - pageMargin - 50, 15, 15);
        }
    })
    //doc.line(pageMargin, nextYPos-padding, liveArea.width, nextYPos-padding);
    return nextYPos;
}